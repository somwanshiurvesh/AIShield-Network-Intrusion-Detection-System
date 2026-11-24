FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Fix for bcrypt issue
RUN pip install --upgrade bcrypt==4.0.1

# Copy all backend files
COPY . .

# Create necessary directories - ensure they exist
RUN mkdir -p data models eval/plots

# Expose port
EXPOSE 8000

# Health check
# Uncomment for production use:
# HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
#   CMD curl -f http://localhost:8000/health || exit 1

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 