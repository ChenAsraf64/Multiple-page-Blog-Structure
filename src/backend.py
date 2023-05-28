from flask import Flask, request
from setting import dbpwd
import mysql.connector as mysql
import json
import bcrypt
from flask_cors import CORS


# Connect to the MySQL database
db = mysql.connect(
	host = "localhost",
	user = "root",
	passwd = dbpwd,
	database = "chendata")

#print(db)

app = Flask(__name__)
CORS(app)


@app.route('/posts', methods=['GET', 'POST'])
def manage_posts():
	if request.method == 'GET':   
		return get_all_posts()
	else:
		return add_post()

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

def add_post():
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