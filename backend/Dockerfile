FROM python:3.9-slim

# Install graphviz dependencies
RUN apt-get update && \
    apt-get install -y graphviz && \
    apt-get clean

# Set workdir
WORKDIR /app

# Copy requirements & install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY app/ app/

# Expose port
EXPOSE 8000

# Run server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
