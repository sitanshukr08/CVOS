# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install LaTeX and required system dependencies
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Change to the backend directory and start the server
WORKDIR /app/core-backend
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]