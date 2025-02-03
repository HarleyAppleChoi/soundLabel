# Voice Annotation Tool

## Description
This project is a technical test for PolyAI. It uses Go as a backend and React(Next.js) for frontend and middleware of the grpc communication between frontend and backend. This project allow user to mark speech segments and store it in the backend. The audio and and segments informations are streamed from backend.

## Features

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Speech Segmentation    | Allows users to mark the segment speech in audio files.                     |
| GRPC Communication     | Facilitates communication between the frontend and backend using GRPC.      |
| Data Storage           | Stores annotated speech segments in the file in the backend.                               |

## Flow
| Step | User Action                        | Frontend (React/Next.js)                  | Backend (Go)                              |
|------|------------------------------------|-------------------------------------------|-------------------------------------------|
| 1    | User visit the frontpage          | Displays a button that allow user to start the quest         |  Get Quired and return a queue of segment url for user to annotate in the quest              |
| 2    | User marks speech segments         | Display the annotation interface and allow user to mark down annotation     | Stream audio and segment data via GRPC            |
| 3    | User submit annotations             | Sends annotation data to backend and ready to query for next segment in the queue         | Stores annotations in the file in .csv        |
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
1. Prevent user submit unfinished response
2. Save the response in another .csv file for further analytics
3. Have start/finish page for users
4. Process bar to make sure user know how much they left to do in their task

## Assumption
1. Assume all segment audio file are saved in backend/resources/audio
2. All response are saved in backend/resources/segments_with_labels.csv
3. There is very few audio file and they don't need pagination/ seperate into different batches
4. Allow multiple responses for a single segment


