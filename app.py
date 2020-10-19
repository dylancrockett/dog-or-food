from flask import Flask, render_template
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from model import load_model, predict_image
import werkzeug
import uuid


# resource for predicting if an uploaded image is a dog or food
class PredictImage(Resource):
    def __init__(self):
        # argument parser
        self.parse = reqparse.RequestParser()
        self.parse.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files')

        # predictive model
        self.model = load_model()

    def post(self):
        # parse args
        args = self.parse.parse_args()

        # get the file from the args
        file = args['file']

        # generate a file id and save the file
        file_id = str(uuid.uuid4())
        file.save("./uploads/" + file_id + ".jpg")

        # predict the image
        result = predict_image("./uploads/" + file_id + ".jpg", self.model)
        print(result)

        return result, 200


# app class
app = Flask(__name__)

# api
api = Api(app, prefix="/api")

# cors module
CORS(app, resources={r"/api/*": {"origins": "*"}})

# add resource
api.add_resource(PredictImage, "/predict")


# route for rendering app
@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run()
