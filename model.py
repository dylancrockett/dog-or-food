import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# dataset image parameters
batch_size = 32
img_height = 180
img_width = 180


# returns a new model
def get_model():
    # define the model
    model = tf.keras.Sequential([
        layers.experimental.preprocessing.Rescaling(1. / 255),
        layers.Conv2D(32, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(32, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(32, 3, activation='relu'),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(2)
    ])

    # compile the model
    model.compile(
        optimizer='adam',
        loss=tf.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=['accuracy'])

    return model


# function to create a model an train it
def train_model(train_ds, val_ds, epochs: int = 3):
    # get a model
    model = get_model()

    # fit the model to the data
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=3)

    # save the model after training
    model.save_weights("./model/classifier")


# loads the model from file and returns it
def load_model():
    # get a model
    model = get_model()

    # load the model
    model.load_weights("./model/classifier")

    return model


# predicts the image type given the image path and the model to use
# run's a given image through the model
def predict_image(path: str, model) -> dict:
    # load the image from the path
    img = keras.preprocessing.image.load_img(
        path, target_size=(img_height, img_width)
    )

    # convert the image to an array
    img_array = keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)

    # have the model predict
    predictions = model.predict(img_array)

    # get the scores as a %
    score = tf.nn.softmax(predictions[0])

    return {
        "dog": round(float(100 * score[0]), 2),
        "food": round(float(100 * score[1]), 2)
    }
