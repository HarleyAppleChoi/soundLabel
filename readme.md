# Voice Annotation Tool

## Description
This project is a technical test for PolyAI. It uses Go as a backend and React(Next.js) for the frontend and middleware of the grpc communication between the frontend and backend. This project allows users to mark speech segments and store the label in the backend. The audio and segment information are streamed from the backend.

## Features

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Speech Segmentation    | Allows users to mark the segment speech in audio files.                     |
| GRPC Communication     | Facilitates communication between the front end and back end using GRPC.      |
| Data Storage           | Stores annotated speech segments in the file in the backend.                               |

## Flow
| Step | User Action                        | Frontend (React/Next.js)                  | Backend (Go)                              |
|------|------------------------------------|-------------------------------------------|-------------------------------------------|
| 1    | User visits the frontpage          | Displays a button that allows the user to start the quest         |  Get Quired and returns a queue of segment URLs for the user to annotate in the quest              |
| 2    | User marks speech segments         | Display the annotation interface and allow the user to mark down annotation     | Stream audio and segment data via GRPC            |
| 3    | User submits annotations             | Sends annotation data to backend and ready to query for next segment in the queue         | Append annotations in the .csv file       |
| 4    | User finish the queue       | Display finish page    | -   |

## Installation
To install the project, follow these steps:
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/my-project.git
    ```

### Frontend
2. Navigate to the project directory:
    ```bash
    cd frontend
    ```

3. Install the dependencies:
    ```bash
    yarn install
    ```

4. Run development server:
    ```bash
    yarn dev
    ```

### Backend
2. Navigate to the project directory:
    ```bash
    cd backend
    ```

3. Run the project:
    ```bash
    make run
    ```


## Feature
1. Prevent the user from submitting an unfinished response
2. Save the response in another .csv file for further analytics
3. Have a start/finish page for users
4. Process bar to make sure user know how much they left to do in their task

## Assumption
1. Assume all segment audio files are saved in the backend/resources/audio
2. All responses are saved in backend/resources/segments_with_labels.csv
3. There are very few audio files and they don't need pagination/separate into different batches
4. Allow multiple responses for a single segment


