from flask import Flask, request, abort, make_response
from setting import dbpwd
import mysql.connector as mysql
import json
import uuid
import bcrypt
from flask_cors import CORS


# Connect to the MySQL database
db = mysql.connect(
    host="localhost",
    user="root",
    passwd=dbpwd,
    database="chendata")

# print(db)

app = Flask(__name__)
CORS(app, supports_credentials=True)


@app.route('/posts', methods=['GET', 'POST'])
def manage_posts():
    if request.method == 'GET':
        return get_all_posts()
    else:
        return add_post()


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # print(data)
    query = "select id, username, password from users where username = %s"
    values = (data['user'], )
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if not record:
        abort(401)

    user_id = record[0]
    hashed_pwd = record[2].encode('utf-8')
    # print(f"Hashed password from database: {hashed_pwd}")
    # Comparing the hashed password from database with the hashed version of the entered password
    if bcrypt.checkpw(data['pass'].encode('utf-8'), hashed_pwd) is not True:
        abort(401)

    query = "insert into sessions (user_id, session_id) values (%s, %s)"
    session_id = str(uuid.uuid4())
    values = (record[0], session_id)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    resp = make_response()
    resp.set_cookie("session_id", session_id, secure=False, samesite='Lax')
    return resp


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['user']
    password = data['pass']
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    query = "insert into users (username, password) values (%s, %s)"
    values = (username, hashed_password)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    return "User created"


@app.route('/logout', methods=['POST'])
def logout():
    session_id = request.cookies.get("session_id")
    if session_id:
        query = "DELETE FROM sessions WHERE session_id = %s"
        values = (session_id,)
        cursor = db.cursor()
        cursor.execute(query, values)
        db.commit()
        cursor.close()
    resp = make_response()
    resp.delete_cookie("session_id")
    return resp


def get_all_posts():
    query = "select id, title, body, user_id from posts"
    cursor = db.cursor()
    cursor.execute(query)
    records = cursor.fetchall()
    cursor.close()
    print(records)
    # [{"id": 1, "title": "First Post", "body": "This is the content of the first post."}, {"id": 2, "title": "Second Post", "body": "This is the content of the second post."}, ....
    header = ['id', 'title', 'body', 'user_id']
    data = []
    for r in records:
        data.append(dict(zip(header, r)))
    return json.dumps(data)


def get_post(id):
    query = "select id, title, body, user_id from posts where id = %s"
    values = (id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    header = ['id', 'title', 'body', 'user_id']
    return json.dumps(dict(zip(header, record)))


def check_login():
    session_id = request.cookies.get("session_id")
    if not session_id:
        abort(401)
    query = "select user_id from sessions where session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if not record:
        abort(401)


def add_post():
    check_login()
    data = request.get_json()
    print(data)
    query = "SELECT id from users where username = %s"
    values = (data['user_id'],)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    id = record[0]
    cursor.close()
    query = "insert into posts (title, body, user_id) values (%s, %s, %s)"
    values = (data['title'], data['body'], id)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_post_id = cursor.lastrowid
    cursor.close()
    return get_post(new_post_id)


if __name__ == "__main__":
    app.run()
