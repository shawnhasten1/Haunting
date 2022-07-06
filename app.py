from flask import Flask, json, jsonify, request, session
from flask.templating import render_template
import pymongo
from bson.objectid import ObjectId

app = Flask(__name__)
app.secret_key = '2abceVR5ENE7FgMxXdMwuzUJKC2g8xgy'
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

def connectToDB():
    client = pymongo.MongoClient(config.mongo_url)
    mongoDB = client['haunting']
    return mongoDB

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/v1/get_tiles')
def getTiles():
    mongoDB = connectToDB()
    tiles_col = mongoDB['tiles']
    upper_tiles = []
    aggr_qry = [
        { '$match': { 'floor' : { '$in' : ['upper'] } } },
        { '$sample': { 'size': 20 } }
    ]
    for tile in tiles_col.aggregate(aggr_qry):
        upper_tiles.append(convertToJSON(tile))

    ground_tiles = []
    aggr_qry = [
        { '$match': { 'floor' : { '$in' : ['ground'] } } },
        { '$sample': { 'size': 20 } }
    ]
    for tile in tiles_col.aggregate(aggr_qry):
        if tile not in upper_tiles:
            ground_tiles.append(convertToJSON(tile))

    basement_tiles = []
    aggr_qry = [
        { '$match': { 'floor' : { '$in' : ['ground'] } } },
        { '$sample': { 'size': 20 } }
    ]
    for tile in tiles_col.aggregate(aggr_qry):
        if tile not in upper_tiles and tile not in ground_tiles:
            basement_tiles.append(convertToJSON(tile))
    
    return_post = {
        'upper_tiles':upper_tiles,
        'ground_tiles':ground_tiles,
        'basement_tiles':basement_tiles
    }
    return jsonify(return_post)

@app.route('/api/v1/<collection>')
def getCollection(collection):
    mongoDB = connectToDB()
    collection_col = mongoDB[collection]
    try:
        new_query = convertQueryToJSON(json.loads(request.args.get('query')))
    except:
        new_query = {}
    
    if request.args.get('floor') == 'upper':
        new_query = { 'floor' : { '$in' : ['upper'] } }
    
    elif request.args.get('floor') == 'ground':
        new_query = { 'floor' : { '$in' : ['ground'] } }
    
    elif request.args.get('floor') == 'basement':
        new_query = { 'floor' : { '$in' : ['basement'] } }

    return_data = []
    for row in collection_col.find(new_query):
        new_data = convertToJSON(row)
        return_data.append(new_data)
    return jsonify(return_data)

def convertQueryToJSON(obj):
    objData = {}
    for key in obj:
        if key != 'password':
            if isinstance(obj[key], list):
                objData[key] = []
                thisList = []
                for x in range(0, len(obj[key])):
                    thisDict = {}
                    for listKey in obj[key][x]:
                        try:
                            this_id = ObjectId(obj[key][x][listKey])
                            thisDict[listKey] = this_id
                        except:
                            thisDict[listKey] = obj[key][x][listKey]
                    thisList.append(thisDict)
                
                objData[key] = thisList

            else:
                try:
                    this_id = ObjectId(obj[key])
                    objData[key] = this_id
                except:
                    objData[key] = obj[key]
    try:
        objData['_id'] = objData['id']
        objData.pop('id')
    except:
        pass
    return objData

def convertToJSON(obj):
    objData = {}
    for key in obj:
        if key != 'password':
            if isinstance(obj[key], list):
                objData[key] = []
                thisList = []
                for x in range(0, len(obj[key])):
                    if isinstance(obj[key][x], str):
                        objData[key].append(str(obj[key][x]))
                    elif isinstance(obj[key][x], bytes):
                        objData[key].append(str(obj[key][x]))
                    elif isinstance(obj[key][x], bool):
                        objData[key].append((obj[key][x]))
                    elif isinstance(obj[key][x], int):
                        objData[key] = getInt(obj[key][x])
                    elif isinstance(obj[key][x], float):
                        objData[key] = getDecimal(obj[key][x])
                    elif isinstance(obj[key][x], ObjectId):
                        objData[key].append(str(obj[key][x]))
                    else:
                        thisDict = {}
                        for listKey in obj[key][x]:
                            #print(listKey)
                            if isinstance(obj[key][x][listKey], str):
                                thisDict[listKey] = str(obj[key][x][listKey])
                            elif isinstance(obj[key][x][listKey], bytes):
                                thisDict[listKey] = str(obj[key][x][listKey])
                            elif isinstance(obj[key][x][listKey], bool):
                                thisDict[listKey] = obj[key][x][listKey]
                            elif isinstance(obj[key][x][listKey], int):
                                thisDict[listKey] = getInt(obj[key][x][listKey])
                            elif isinstance(obj[key][x][listKey], float):
                                thisDict[listKey] = getDecimal(obj[key][x][listKey])
                            elif isinstance(obj[key][x][listKey], ObjectId):
                                thisDict[listKey] = str(obj[key][x][listKey])
                            else:
                                thisDict[listKey] = obj[key][x][listKey]
                        thisList.append(thisDict)
                
                        objData[key] = thisList

            else:
                if isinstance(obj[key], str):
                    objData[key] = str(obj[key])
                elif isinstance(obj[key], bytes):
                    objData[key] = str(obj[key])
                elif isinstance(obj[key], bool):
                    objData[key] = obj[key]
                elif isinstance(obj[key], int):
                    objData[key] = getInt(obj[key])
                elif isinstance(obj[key], float):
                    objData[key] = getDecimal(obj[key])
                elif isinstance(obj[key], ObjectId):
                    objData[key] = str(obj[key])
                else:
                    objData[key] = obj[key]
    try:
        objData['id'] = objData['_id']
        objData.pop('_id')
    except:
        pass
    return objData

    
def getDecimal(x):
    try:
        return float(x)
    except:
        x = 0
        return float(x)

def getInt(x):
    try:
        return int(x)
    except:
        x = 0

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
