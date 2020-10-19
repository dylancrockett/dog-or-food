import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";
import { Typography } from "@material-ui/core";

function App() {
    const [file, setFile] = useState();
    const [uploadProgress, updateUploadProgress] = useState(0);
    const [imageURI, setImageURI] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dog, setDog] = useState(null);
    const [food, setFood] = useState(null);

    const acceptedTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
    ];

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    const isValidFileType = (fileType) => {
        return acceptedTypes.includes(fileType);
    };

    const handleFileUpload = (e) => {
        e.preventDefault();

        if (!isValidFileType(file.type)) {
            alert('Only images are allowed (png or jpg)');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        axios({
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
            url: 'http://localhost:5000/api/predict',
            onUploadProgress: (ev) => {
                const progress = ev.loaded / ev.total * 100;
                updateUploadProgress(Math.round(progress));
            },
        })
        .then((response) => {
            // our mocked response will always return true
            // in practice, you would want to use the actual response object
            setUploadStatus(true);
            setUploading(false);
            getBase64(file, (uri) => {
                setImageURI(uri);
            });
            if (response.status === 200) {
                console.log(response.data);
                setDog(response.data["dog"]);
                setFood(response.data["food"])
            }
        })
        .catch((err) => console.error(err));
    };

    return (
      <div className="app">
        <Typography className={"header"} variant={"h4"}>Upload an Image to check if it is a Dog or Food</Typography>
        <Typography className={"subheader"} variant={"h6"}>Result</Typography>
        <Typography variant={"body2"}>{dog === null ? "Please Upload an Image to get a result!" : "Classification: " + (dog >= food ? "Dog" : "Food")}</Typography>
        <Typography variant={"body2"}>{dog === null ? null : "Confidence: " + String(dog >= food ? dog : food) + "%"}</Typography>
        <div className="filler"/>
        <div className="image-preview-box">
            {(uploadStatus && imageURI)
                ? <img src={imageURI} alt={"preview"} className={"image-preview"}/>
                : null
            }
        </div>
        <form onSubmit={handleFileUpload} className="form">
            <button className="file-chooser-button" type="button">
                Choose File
               <input
                    className="file-input"
                    type="file"
                    name="file"
                    accept={acceptedTypes.toString()}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0])
                        }}
                    }
               />
            </button>
            <button className="upload-button" type="submit">
                Upload
            </button>
        </form>
        {(uploading)
            ?
            <div className="progress-bar-container">
                <CircularProgressbar
                    value={uploadProgress}
                    text={`${uploadProgress}% uploaded`}
                    styles={buildStyles({
                        textSize: '10px',
                        pathColor: 'teal',
                    })}
                />
            </div>
            : null
        }
        </div>
    );
}

export default App;
