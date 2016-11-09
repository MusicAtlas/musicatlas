from flask import Flask, request,g
import json
import pickle
#from bson  import json_util
#from bson.objectid import ObjectId
import psycopg2
import dateutil.parser as dparser  
from flask import jsonify
from flask_cors import CORS, cross_origin
#from flaskext.mysql import MySQL
import ujson


# Flask
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
db_config= None



with open('db_config.p', 'rb') as config_file:
    db_config = pickle.load(config_file)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = psycopg2.connect(database=db_config['DBNAME'], user=db_config['USER'], password=db_config['PASSWORD'])
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def parseDate( date_string):
    return dparser.parse(date_string, fuzzy=True)

@app.route('/api/release/location/', methods=['GET'])
def release_location_count():
    """ RELEASE LOCATION COUNT
    GET /api/release/location/
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor() 
            query = "SELECT * FROM musicbrainz.artist LIMIT 10"
        
    
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                results.append(item)
    
        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})




if __name__ == '__main__':
    from gevent.wsgi import WSGIServer
    http_server = WSGIServer(('db03.cs.utah.edu', 8181), app)
    http_server.serve_forever()

