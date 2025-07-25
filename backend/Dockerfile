FROM python:3.9-slim

# Install graphviz dependencies
RUN apt-get update 
RUN apt-get install -y graphviz 
RUN apt-get clean

# Set workdir
WORKDIR /app

# Copy requirements & install
COPY . .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install cryptography
RUN pip install pymysql

# Expose port
EXPOSE 8000

# Run server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
