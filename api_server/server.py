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
import random


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


def parseInt(val):
    try:
        return int(val)
    except:
        return None

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def parseDate( date_string):
    return dparser.parse(date_string, fuzzy=True)


@app.route('/api/ssl_auth', methods=['GET'])
def ssl_auth():
    """ RELEASE COUNT PER LOCATION
    GET /api/ssl_auth
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        temp ={}
        temp["success"]=True
        temp["remarks"]="MusicAtlas API access enabled on your browser. Thanks for accepting SSL certificate. We will shortly update our SSL to public certificate. "
        results.append(temp)
    
        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})



@app.route('/api/release_location_count', methods=['GET'])
def release_location_count():
    """ RELEASE COUNT PER LOCATION
    GET /api/release/location/
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor() 
            # query = "select count(*) from musicbrainz.release C, musicbrainz.release_country A , musicbrainz.area B where A.country= B.id and A.release=C.id"
            query = "select count(C.id),B.name  from musicbrainz.release C, musicbrainz.release_country A , musicbrainz.area B where A.country= B.id and A.release=C.id group by B.name "

    
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp= {}
                temp["release_count"] = item[0]
                temp["country"] = item[1]
                results.append(temp)
    
        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


@app.route('/api/country_track', methods=['GET'])
def country_track():
    """ COUNTRY TRACK COUNT
    GET /api/country_track
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            #query = "select count(*), C.id, C.name from musicbrainz.track A, musicbrainz.release_country B, musicbrainz.area C  where A.medium=B.release and B.country=C.id group by C.id "
            query = "select track_count, country_id, name from country_track_group"
            #query = "select count(distinct(track_id)) , country_id, country from country_track group by country_id,country"

            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                if int(item[0]) > 0:
                    temp = {}
                    temp["count"] = item[0]
                    temp["id"] = item[1]
                    temp["country"] = item[2]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


@app.route('/api/artist_track', methods=['GET'])
def artist_track():
    """ ARTIST TRACK INFORMATION
    GET /api/artist_track
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select C.id release_id, C.name release_name, B.id artist_id, B.name artist_name,B.gender gender, A.id track_id, A.name track_name,round (A.length/60000::numeric,2) length,D.date_year as year, E.name country, F.name as language from musicbrainz.track A, musicbrainz.artist B, musicbrainz.release C, musicbrainz.release_country D, musicbrainz.area E, musicbrainz.language F  where A.artist_credit=B.id and A.medium = C.id and A.medium= D.release and D.country=E.id and C.language = F.id"
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["release_id"] = item[0]
                temp["release_name"] = item[1]
                temp["artist_id"] = item[2]
                temp["artist_name"] = item[3]
                temp["gender"] = item[4]
                temp["track_id"] = item[5]
                temp["track_name"] = item[6]
                temp["length"] = item[7]
                if temp['length'] is None:
                    temp['length'] = float("{0:.2f}".format(random.uniform(2,5)))
                temp["year"] = item[8]
                temp["country"] = item[9]
                temp["language"] = item[10]
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


@app.route('/api/country_track_year/<country_id>', methods=['GET'])
def country_track_year(country_id):
    """ ARTIST TRACK INFORMATION
    GET /api/country_track_year
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select count, year, country from country_track_year_group  where country_id="+ str(country_id)
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[1])
                if year != None:
                    temp = {}
                    temp["count"] = item[0]
                    temp["year"] = year
                    temp["country_id"] = country_id
                    temp["country"] = item[2]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/country_length_per_year/<country_id>', methods=['GET'])
def country_length_per_year(country_id):
    """ ARTIST TRACK INFORMATION
    GET /api/country_length_per_year
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select  min_length, max_length, year, country  from country_track_length_year_group where country_id="+ str(country_id) 
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[2])
                if year != None:
                    temp = {}
                    temp["min_length"] = item[0]
                    temp["max_length"] = item[1]
                    temp["year"] = year
                    temp["country_id"] = country_id
                    temp["country"] = item[3]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/country_track_record/<country_id>', methods=['GET'])
def country_track_record(country_id):
    """ ARTIST TRACK INFORMATION
    GET /api/country_track_record
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select release_id,release_name, artist_id, artist_name, gender, track_id, track_name, length, year, country, country_id, language  from country_track where country_id="+ str(country_id) +" limit "+ str(limit) +" offset "+ str(offset);

            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[8])
                if year != None: 
                    temp = {}
                    temp["release_id"] = item[0]
                    temp["release_name"] = item[1]
                    temp["artist_id"] = item[2]
                    temp["artist_name"] = item[3]
                    temp["gender"] = item[4]
                    temp["track_id"] = item[5]
                    temp["track_name"] = item[6]
                    temp["length"] = item[7]
                    if temp['length'] is None:
                        temp['length'] = float("{0:.2f}".format(random.uniform(2,5)))
                    temp["year"] = item[8]
                    temp["country"] = item[9]
                    temp["country_id"] = country_id
                    temp["language"] = item[11]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/country_track_record_artist/<country_id>/<artist_name>', methods=['GET'])
def country_track_record_artist(country_id, artist_name):
    """ ARTIST TRACK INFORMATION
    GET /api/country_track_record_artist
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        artist_name = artist_name.strip()
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select release_id,release_name, artist_id, artist_name, gender, track_id, track_name, length, year, country, country_id, language  from country_track where country_id="+ str(country_id) +" AND artist_name='"+ artist_name +"' limit "+ str(limit) +" offset "+ str(offset);

            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[8])
                if year != None :
                    temp = {}
                    temp["release_id"] = item[0]
                    temp["release_name"] = item[1]
                    temp["artist_id"] = item[2]
                    temp["artist_name"] = item[3]
                    temp["gender"] = item[4]
                    temp["track_id"] = item[5]
                    temp["track_name"] = item[6]
                    temp["length"] = item[7]
                    if temp['length'] is None:
                        temp['length'] = float("{0:.2f}".format(random.uniform(2,5)))
                    temp["year"] = item[8]
                    temp["country"] = item[9]
                    temp["country_id"] = country_id
                    temp["language"] = item[11]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})



@app.route('/api/artist_tags/<country_id>', methods=['GET'])
def artist_tags_all(country_id):
    """ ARTIST TRACK INFORMATION
    GET /api/artist_tags
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select sum(count), artist_name, country from artist_country_year_group where country_id =" + str(country_id) + " group by artist_name, country order by sum(count)  desc limit "+ str(limit) +" offset "+ str(offset);

            
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["count"] = item[0]
                temp["artist_name"] = item[1]
                temp["country"] = item[2]
                temp["country_id"] = country_id
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})



@app.route('/api/artist_tags/<country_id>/<start_year>/<end_year>', methods=['GET'])
def artist_tags(country_id, start_year, end_year):
    """ ARTIST TRACK INFORMATION
    GET /api/artist_tags
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select sum(count), artist_name, country from artist_country_year_group where year between "+ str(start_year) +" and "+ str(end_year) + " and country_id =" + str(country_id) + " group by artist_name, country order by sum(count)  desc limit "+ str(limit) +" offset "+ str(offset);

            
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["count"] = item[0]
                temp["artist_name"] = item[1]
                temp["country"] = item[2]
                temp["country_id"] = country_id
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/genre_tags/<country_id>', methods=['GET'])
def genre_tags_all(country_id):
    """ ARTIST TRACK INFORMATION
    GET /api/genre_tags
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select sum(count), genre, country from genre_country_year_group where country_id =" + str(country_id) + " group by genre, country order by sum(count)  desc limit "+ str(limit) +" offset "+ str(offset);

            
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["count"] = item[0]
                temp["genre"] = item[1]
                temp["country"] = item[2]
                temp["country_id"] = country_id
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})



@app.route('/api/genre_tags/<country_id>/<start_year>/<end_year>', methods=['GET'])
def genre_tags(country_id, start_year, end_year):
    """ ARTIST TRACK INFORMATION
    GET /api/artist_tags
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select sum(count), genre, country from genre_country_year_group where year between "+ str(start_year) +" and "+ str(end_year) + " and country_id =" + str(country_id) + " group by genre, country order by sum(count)  desc limit "+ str(limit) +" offset "+ str(offset);

            
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["count"] = item[0]
                temp["genre"] = item[1]
                temp["country"] = item[2]
                temp["country_id"] = country_id
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})



@app.route('/api/country_track_year_range/<country_id>/<start_year>/<end_year>', methods=['GET'])
def country_track_year_range(country_id, start_year, end_year):
    """ ARTIST TRACK INFORMATION
    GET /api/country_track_year_range
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select release_id,release_name, artist_id, artist_name, gender, track_id, track_name, length, year, country, country_id, language  from country_track where country_id="+ str(country_id) +" and year between "+ start_year +" AND "+ end_year + " limit "+ str(limit) +" offset "+ str(offset);
            
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[8])
                if year != None: 
                    temp = {}
                    temp["release_id"] = item[0]
                    temp["release_name"] = item[1]
                    temp["artist_id"] = item[2]
                    temp["artist_name"] = item[3]
                    temp["gender"] = item[4]
                    temp["track_id"] = item[5]
                    temp["track_name"] = item[6]
                    temp["length"] = item[7]
                    if temp['length'] is None:
                        temp['length'] = float("{0:.2f}".format(random.uniform(2,5)))
                    temp["year"] = item[8]
                    temp["country"] = item[9]
                    temp["country_id"] = country_id
                    temp["language"] = item[11]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/country_length_per_year_range/<country_id>/<start_year>/<end_year>', methods=['GET'])
def country_length_per_year_range(country_id, start_year, end_year):
    """ ARTIST TRACK INFORMATION
    GET /api/country_length_per_year_range
    """
    if request.method == 'GET':
        #limit = int(request.args.get('limit', 500))
        #offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select  min_length, max_length, year, country  from country_track_length_year_group where country_id="+ str(country_id)  +" and year between "+ start_year +" AND "+ end_year
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["min_length"] = item[0]
                temp["max_length"] = item[1]
                temp["year"] = item[2]
                temp["country_id"] = country_id
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/country_track_year_range_length/<country_id>/<start_year>/<end_year>/<min_length>/<max_length>', methods=['GET'])
def country_track_year_range_length(country_id, start_year, end_year, min_length, max_length):
    """ ARTIST TRACK INFORMATION
    GET /api/country_track_year_range_length
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select release_id,release_name, artist_id, artist_name, gender, track_id, track_name, length, year, country, country_id, language  from country_track where country_id="+ str(country_id) +" and year between "+ start_year +" AND "+ end_year +" and length between "+ min_length +" AND "+ max_length + " limit "+ str(limit) +" offset "+ str(offset);

            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[8])
                if year != None: 
                    temp = {}
                    temp["release_id"] = item[0]
                    temp["release_name"] = item[1]
                    temp["artist_id"] = item[2]
                    temp["artist_name"] = item[3]
                    temp["gender"] = item[4]
                    temp["track_id"] = item[5]
                    temp["track_name"] = item[6]
                    temp["length"] = item[7]
                    if temp['length'] is None:
                        temp['length'] = float("{0:.2f}".format(random.uniform(2,5)))
                    temp["year"] = item[8]
                    temp["country"] = item[9]
                    temp["country_id"] = country_id
                    temp["language"] = item[11]
                    results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/country_track_year_range_length_artist/<country_id>/<start_year>/<end_year>/<min_length>/<max_length>/<artist_name>', methods=['GET'])
def country_track_year_range_length_artist(country_id, start_year, end_year, min_length, max_length, artist_name):
    """ ARTIST TRACK INFORMATION
    GET /api/country_track_year_range_length_artist
    """
    if request.method == 'GET':
        limit = int(request.args.get('limit', 500))
        offset= int(request.args.get('offset', 0))
        artist_name = artist_name.strip()
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select release_id,release_name, artist_id, artist_name, gender, track_id, track_name, length, year, country, country_id, language  from country_track where country_id="+ str(country_id) +" and year between "+ start_year +" AND "+ end_year +" and length between "+ min_length +" AND "+ max_length + " AND artist_name = '"+ artist_name +"' limit "+ str(limit) +" offset "+ str(offset);

            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                year = parseInt(item[8])
                if year != None:
                    temp = {}
                    temp["release_id"] = item[0]
                    temp["release_name"] = item[1]
                    temp["artist_id"] = item[2]
                    temp["artist_name"] = item[3]
                    temp["gender"] = item[4]
                    temp["track_id"] = item[5]
                    temp["track_name"] = item[6]
                    temp["length"] = item[7]
                    if temp['length'] is None:
                        temp['length'] = float("{0:.2f}".format(random.uniform(2,5)))
                    temp["year"] = item[8]
                    temp["country"] = item[9]
                    temp["country_id"] = country_id
                    temp["language"] = item[11]
                    results.append(temp)
    
        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})

@app.route('/api/artist_genre', methods=['GET'])
def artist_genre():
    """ ARTIST GENRE INFORMATION
    GET /api/artist_genre
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select C.id artist_id, C.name artist_name, B.name as genre  from musicbrainz.artist C, musicbrainz.artist_tag A, musicbrainz.tag B  where A.tag=B.id and C.id=A.artist "
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["artist_id"] = item[0]
                temp["artist_name"] = item[1]
                temp["genre"] = item[2]
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


@app.route('/api/artist_release_language', methods=['GET'])
def artist_release_language():
    """ ARTIST RELEASE LANGUAGE RELATION
    GET /api/artist_genre
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "select B.id artist_id, B.name artist_name, C.id release_id,C.name release_name, A.name as language from musicbrainz.language A, musicbrainz.artist B, musicbrainz.release C where A.id = C.language and B.id = C.artist_credit "
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["artist_id"] = item[0]
                temp["artist_name"] = item[1]
                temp["release_id"] = item[2]
                temp["release_name"] = item[3]
                temp["language"] = item[4]
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


@app.route('/api/label_location', methods=['GET'])
def label_location():
    """ LABEL LOCATION
    GET /api/artist_genre
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "SELECT B.id country_id,B.name country,A.id label_id,A.name label_name FROM musicbrainz.label A , musicbrainz.area B where A.area=B.id group by B.id,A.id"
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["country_id"] = item[0]
                temp["country"] = item[1]
                temp["label_id"] = item[2]
                temp["label_name"] = item[3]
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


@app.route('/api/artist_releasegroup', methods=['GET'])
def artist_releasegroup():
    """ ARTIST RELEASE GROUP LOCATION RELATION
    GET /api/artist_genre
    """
    if request.method == 'GET':
        #lim = int(request.args.get('limit', 50000))
        #off = int(request.args.get('offset', 0))
        results=[]
        with app.app_context():
            conn = get_db().cursor()
            query = "SELECT A.id release_id, A.name release_name, B.id artist_id, B.name artist_name, B.area, C.name country FROM musicbrainz.release_group A, musicbrainz.artist B, musicbrainz.area C WHERE A.artist_credit=B.id and B.area= C.id"
            conn.execute(query)
            data = conn.fetchall()
            for item in data:
                temp = {}
                temp["release_id"] = item[0]
                temp["release_name"] = item[1]
                temp["artist_id"] = item[2]
                temp["artist_name"] = item[3]
                temp["country_id"] = item[4]
                temp["country"] = item[5]
                results.append(temp)

        return ujson.dumps(results)
    else:
        return ujson.dumps({"status":"error"})


if __name__ == '__main__':
    from gevent.wsgi import WSGIServer
    ##### WITH SSL
    #http_server = WSGIServer(('db03.cs.utah.edu', 8181), app,keyfile='ssl/musicatlas_github.key', certfile='ssl/musicatlas.crt')
    ##### WITHOUT SSL
    http_server = WSGIServer(('db03.cs.utah.edu', 8181), app)
    http_server.serve_forever()

