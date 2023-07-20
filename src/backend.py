from datetime import datetime
from flask import Flask, request, abort, make_response
from setting import dbpwd
from mysql.connector import pooling
import json
import uuid
import bcrypt
from flask_cors import CORS


# Create a pool of MySQL connections
db_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,
    pool_reset_session=True,
    host="localhost",
    user="root",
    passwd=dbpwd,
    database="chendata"
)


# Get a connection from the pool
def get_db_conn():
    try:
        return db_pool.get_connection()
    except Exception as e:
        print(f"Failed to get DB connection: {e}")
        return None


app = Flask(__name__)


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin',
                         'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route('/posts', methods=['GET', 'POST'])
def manage_posts():
    if request.method == 'GET':
        return get_all_posts()
    else:
        return add_post()


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Received login request data: {data}")  # Print the request data
    query = "SELECT id, username, password FROM users WHERE username = %s"
    values = (data['user'], )
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()

    # Print the fetched database record
    print(f"Database record for username: {record}")

    if not record:
        # Print message if no user is found
        print("No matching user record found in the database")
        cursor.close()
        db.close()
        abort(401)

    user_id = record[0]
    hashed_pwd = record[2].encode('utf-8')
    print(f"Hashed password from database: {hashed_pwd}")

    # Comparing the hashed password from database with the hashed version of the entered password
    if bcrypt.checkpw(data['pass'].encode('utf-8'), hashed_pwd) is not True:
        # Print message if password check fails
        print("Password does not match the hashed password in the database")
        cursor.close()
        db.close()
        abort(401)

    session_id = str(uuid.uuid4())
    query = """INSERT INTO sessions (user_id, session_id) VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE session_id = VALUES(session_id)"""
    values = (user_id, session_id)
    cursor.execute(query, values)
    db.commit()

    cursor.close()
    db.close()
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
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()
    return "User created"


@app.route('/logout', methods=['POST'])
def logout():
    session_id = request.cookies.get("session_id")
    if session_id:
        query = "DELETE FROM sessions WHERE session_id = %s"
        values = (session_id,)
        db = get_db_conn()
        cursor = db.cursor()
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        db.close()
    resp = make_response()
    resp.set_cookie("session_id", '', expires=0)
    return resp


def get_all_posts():
    db = get_db_conn()
    cursor = db.cursor()
    # Fetch all posts and authors in one query
    posts_query = """
        SELECT posts.id, posts.title, posts.body, posts.user_id, posts.created_at as published, users.username
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
    """
    cursor.execute(posts_query)
    posts_records = cursor.fetchall()
    data = []
    # Fetch the author of each post
    for post in posts_records:
        author_query = "SELECT username FROM users WHERE id = %s"
        cursor.execute(author_query, (post[3],))  # post[3] should be user_id
        author_record = cursor.fetchone()
        # Convert datetime object to string
        published = post[4].strftime('%Y-%m-%d %H:%M:%S') if post[4] else None
        post_data = {
            'id': post[0],
            'title': post[1],
            'body': post[2],
            'user_id': post[3],
            'author': author_record[0] if author_record else None,
            'published': published
        }
        data.append(post_data)
    cursor.close()
    db.close()
    return json.dumps(data)


def get_post(id):
    query = "select id, title, body, user_id from posts where id = %s"
    values = (id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    db.close()
    header = ['id', 'title', 'body', 'user_id']
    return json.dumps(dict(zip(header, record)))


def check_login():
    session_id = request.cookies.get("session_id")
    if not session_id:
        abort(401)
    query = "select user_id from sessions where session_id = %s"
    values = (session_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    db.close()
    if not record:
        abort(401)
    return record[0]  # return the user_id


def add_post():
    user_id = check_login()  # get the user_id from the active session
    data = request.get_json()
    print(data)
    # query = "SELECT id from users where username = %s"
    # values = (data['user_id'],)
    # cursor = db.cursor()
    # cursor.execute(query, values)
    # record = cursor.fetchone()
    # id = record[0]
    # cursor.close()
    query = "insert into posts (title, body, user_id) values (%s, %s, %s)"
    values = (data['title'], data['body'], user_id)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_post_id = cursor.lastrowid
    cursor.close()
    db.close()
    return get_post(new_post_id)


@app.route('/user_posts', methods=['GET'])
def get_user_posts():
    user_id = check_login()  # get the user_id from the active session
    query = "SELECT id, title, body, user_id FROM posts WHERE user_id = %s"
    values = (user_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    records = cursor.fetchall()
    cursor.close()
    db.close()
    header = ['id', 'title', 'body', 'user_id']
    data = []
    for r in records:
        data.append(dict(zip(header, r)))
    return json.dumps(data)


def verify_author(post_id, user_id):
    query = "select user_id from posts where id = %s"
    values = (post_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    db.close()

    if not record or record[0] != user_id:
        abort(403)  # Forbidden


@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    user_id = check_login()  # get the user_id from the active session
    data = request.get_json()

    verify_author(post_id, user_id)

    query = "update posts set title = %s, body = %s where id = %s"
    values = (data['title'], data['body'], post_id)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()

    return get_post(post_id)


@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    user_id = check_login()  # get the user_id from the active session

    verify_author(post_id, user_id)

    query = "delete from posts where id = %s"
    values = (post_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()

    return "Post deleted"
############################################


@app.route('/posts/<int:post_id>/comments', methods=['GET', 'POST'])
def manage_comments(post_id):
    if request.method == 'GET':
        return get_comments(post_id)
    else:
        return add_comment(post_id)


def add_comment(post_id):
    user_id = check_login()  # get the user_id from the active session
    data = request.get_json()
    query = "INSERT INTO comments (post_id, user_id, content) VALUES (%s, %s, %s)"
    values = (post_id, user_id, data['content'])
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_comment_id = cursor.lastrowid
    cursor.close()
    db.close()
    return get_comments(new_comment_id)


def get_comments(post_id):
    query = "SELECT id, post_id, user_id, content, created_at FROM comments WHERE post_id = %s"
    values = (post_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    records = cursor.fetchall()
    cursor.close()
    db.close()
    header = ['id', 'post_id', 'user_id', 'content', 'created_at']
    data = []
    for r in records:
        comment_dict = dict(zip(header, r))
        # convert datetime to string
        comment_dict['created_at'] = comment_dict['created_at'].isoformat()
        data.append(comment_dict)
    return json.dumps(data)


########################################

@app.route('/search', methods=['GET'])
def search_posts():
    search_text = request.args.get('query')
    if not search_text:
        abort(400, 'No search text provided')
    search_text = "%" + search_text + "%"  # Prepare the text for the LIKE operator
    query = "SELECT id, title, body, user_id, created_at FROM posts WHERE body LIKE %s"
    values = (search_text,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    records = cursor.fetchall()
    cursor.close()
    db.close()
    header = ['id', 'title', 'body', 'user_id', 'created_at']
    data = []
    for r in records:
        record_dict = dict(zip(header, r))
        record_dict['created_at'] = record_dict['created_at'].strftime(
            '%Y-%m-%d %H:%M:%S')  # convert datetime to string
        data.append(record_dict)
    return json.dumps(data)

 ###########################################


if __name__ == "__main__":
    app.run()
