import base64
from datetime import datetime
from flask import Flask, request, abort, make_response, send_from_directory, jsonify
from setting import dbpwd
from mysql.connector import pooling
import json
import uuid
import bcrypt
from flask_cors import CORS
from PIL import Image
import os
from werkzeug.utils import secure_filename


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
CORS(app)


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
        SELECT posts.id, posts.title, posts.body, posts.user_id, posts.created_at as published, users.username, posts.views, posts.likes
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        ORDER BY posts.likes DESC, posts.views DESC
    """
    cursor.execute(posts_query)
    posts_records = cursor.fetchall()
    data = []
    # Fetch the author of each post
    for post in posts_records:
        # Convert datetime object to string
        published = post[4].strftime('%Y-%m-%d %H:%M:%S') if post[4] else None
        post_data = {
            'id': post[0],
            'title': post[1],
            'body': post[2],
            'user_id': post[3],
            'author': post[5] if post[5] else None,
            'published': published,
            # Fetch and include tags in the response
            'tags': get_post_tags(post[0])
        }
        data.append(post_data)
    cursor.close()
    db.close()
    return json.dumps(data)


@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    db = get_db_conn()
    cursor = db.cursor()
    query = "SELECT id, title, body, user_id, created_at, views, likes, image FROM posts WHERE id = %s"
    values = (post_id,)
    cursor.execute(query, values)
    record = cursor.fetchone()
    if not record:
        abort(404, 'Post not found')
    cursor.close()
    db.close()
    header = ['id', 'title', 'body', 'user_id',
              'created_at', 'views', 'likes', 'image']
    post = dict(zip(header, record))
    post['created_at'] = post['created_at'].strftime('%Y-%m-%d %H:%M:%S')
    post['tags'] = get_post_tags(post_id)
    return json.dumps(post)

##############################################################


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

    image_file = request.files.get('image')

    if image_file:
        filename = secure_filename(image_file.filename)  # Secure the filename
        image_path = os.path.join('C:/Users/97252/Downloads', filename)
        image = Image.open(image_file)
        image.save(image_path)
    else:
        image_path = None

    title = request.form.get('title')
    body = request.form.get('body')
    tags = request.form.get('tags').split(',')

    query = "insert into posts (title, body, user_id, image) values (%s, %s, %s, %s)"
    values = (title, body, user_id, filename)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_post_id = cursor.lastrowid
    # Insert tags into the database if they exist in the request data
    if tags:
        for tag in tags:
            # Check if the tag already exists in the tags table
            query = "SELECT id FROM tags WHERE name = %s"
            cursor.execute(query, (tag,))
            result = cursor.fetchone()
            if result is None:  # If the tag doesn't exist, add it to the tags table
                query = "INSERT INTO tags (name) VALUES (%s)"
                cursor.execute(query, (tag,))
                db.commit()
                tag_id = cursor.lastrowid
            else:  # If the tag does exist, get its id
                tag_id = result[0]
            # Insert the post_id and tag_id into the post_tags table
            query = "INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s)"
            values = (new_post_id, tag_id)
            cursor.execute(query, values)
        db.commit()
    cursor.close()
    db.close()
    return get_post(new_post_id)


@app.route('/user_posts', methods=['GET'])
def get_user_posts():
    user_id = check_login()  # get the user_id from the active session
    query = """
        SELECT p.id, p.title, p.body, p.user_id, GROUP_CONCAT(t.name) as tags
        FROM posts p
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON t.id = pt.tag_id
        WHERE p.user_id = %s
        GROUP BY p.id
    """
    values = (user_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    records = cursor.fetchall()
    cursor.close()
    db.close()
    header = ['id', 'title', 'body', 'user_id', 'tags']
    data = []
    for r in records:
        post = dict(zip(header, r))
        post['tags'] = post['tags'].split(',') if post['tags'] else []
        data.append(post)
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
    db = get_db_conn()
    cursor = db.cursor()
    # First, delete the associated tags in the `post_tags` table
    delete_tags_query = "delete from post_tags where post_id = %s"
    cursor.execute(delete_tags_query, (post_id,))
    # Second, delete the associated comments in the `comments` table
    delete_comments_query = "delete from comments where post_id = %s"
    cursor.execute(delete_comments_query, (post_id,))
    # Next, delete the associated likes in the `post_likes` table
    delete_likes_query = "delete from post_likes where post_id = %s"
    cursor.execute(delete_likes_query, (post_id,))
    # Then, delete the post in the `posts` table
    delete_post_query = "delete from posts where id = %s"
    cursor.execute(delete_post_query, (post_id,))
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


@app.route('/user_comments', methods=['GET'])
def get_user_comments():
    user_id = check_login()  # get the user_id from the active session
    query = "SELECT id, post_id, user_id, content, created_at FROM comments WHERE user_id = %s"
    values = (user_id,)
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
    search_query = request.args.get('query')
    if not search_query:
        return jsonify([])

    db = get_db_conn()
    cursor = db.cursor()

    # Using LIKE with the wildcard '%' to get posts that match the search query in title or body
    query = """
        SELECT posts.id, posts.title, posts.body, posts.user_id, posts.created_at as published, users.username
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        WHERE posts.title LIKE %s OR posts.body LIKE %s
        ORDER BY posts.created_at DESC
    """
    values = (f"%{search_query}%", f"%{search_query}%")

    cursor.execute(query, values)
    posts_records = cursor.fetchall()
    data = []

    # Convert each post to the desired format
    for post in posts_records:
        published = post[4].strftime('%Y-%m-%d %H:%M:%S') if post[4] else None
        post_data = {
            'id': post[0],
            'title': post[1],
            'body': post[2],
            'user_id': post[3],
            'author': post[5],
            'published': published,
            'tags': get_post_tags(post[0])
        }
        data.append(post_data)

    cursor.close()
    db.close()

    return jsonify(data)

 ###########################################


def get_post_tags(post_id):
    query = """
    SELECT tags.name
    FROM post_tags 
    INNER JOIN tags ON post_tags.tag_id = tags.id 
    WHERE post_tags.post_id = %s
    """
    values = (post_id,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    results = cursor.fetchall()
    cursor.close()
    db.close()
    # As results will be a list of tuples, we convert it to a list of strings
    return [result[0] for result in results]


@app.route('/posts/tag/<tag>', methods=['GET'])
def get_posts_by_tag(tag):
    query = """
        SELECT p.id, p.title, p.body, p.user_id, p.likes, p.image, GROUP_CONCAT(t.name) as tags
        FROM posts p
        JOIN post_tags pt ON p.id = pt.post_id
        JOIN tags t ON t.id = pt.tag_id
        WHERE t.name = %s
        GROUP BY p.id
    """
    values = (tag,)
    db = get_db_conn()
    cursor = db.cursor()
    cursor.execute(query, values)
    records = cursor.fetchall()
    cursor.close()
    db.close()
    header = ['id', 'title', 'body', 'user_id', 'likes', 'image', 'tags']
    data = []
    for r in records:
        post = dict(zip(header, r))
        post['tags'] = post['tags'].split(',') if post['tags'] else []
        data.append(post)
    return json.dumps(data)

###########################################


@app.route('/posts/<int:post_id>/like', methods=['POST'])
def add_post_like(post_id):
    user_id = check_login()  # get the user_id from the active session
    db = get_db_conn()
    cursor = db.cursor()
    query = "SELECT * FROM post_likes WHERE post_id = %s AND user_id = %s"
    values = (post_id, user_id)
    cursor.execute(query, values)
    record = cursor.fetchone()
    if record:  # If user already liked the post
        return "You already liked this post"
    query = "INSERT INTO post_likes (post_id, user_id) VALUES (%s, %s)"
    cursor.execute(query, values)
    query = "UPDATE posts SET likes = likes + 1 WHERE id = %s"
    cursor.execute(query, (post_id,))
    db.commit()
    cursor.close()
    db.close()
    return "Liked the post"


@app.route('/popular-posts', methods=['GET'])
def get_popular_posts():
    db = get_db_conn()
    cursor = db.cursor()
    # Fetch popular posts based on the count of views or likes
    popular_posts_query = """
        SELECT posts.id, posts.title, posts.body, posts.user_id, posts.created_at as published, users.username, posts.views, posts.likes, posts.image
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        ORDER BY posts.likes DESC, posts.views DESC
        LIMIT 15
    """
    cursor.execute(popular_posts_query)
    posts_records = cursor.fetchall()
    data = []
    # Fetch the author of each post
    for post in posts_records:
        # Convert datetime object to string
        published = post[4].strftime('%Y-%m-%d %H:%M:%S') if post[4] else None
        image = post[8]
        # Check if the image data is in bytes
        if isinstance(image, bytes):
            # Convert the byte data to a string, assuming it's a filepath
            image_path = image.decode("utf-8")
            # Extract the filename from the absolute path
            image_filename = os.path.basename(image_path)
            image = image_filename
        post_data = {
            'id': post[0],
            'title': post[1],
            'body': post[2],
            'user_id': post[3],
            'author': post[5] if post[5] else None,
            'published': published,
            'views': post[6],
            'likes': post[7],
            'image': image,
            # Fetch and include tags in the response
            'tags': get_post_tags(post[0])
        }
        data.append(post_data)
    cursor.close()
    db.close()
    return json.dumps(data)

###########################################


@app.route('/images/<path:path>')
def serve_image(path):
    return send_from_directory('C:/Users/97252/Downloads', path)


if __name__ == "__main__":
    app.run()
