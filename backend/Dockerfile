FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt
COPY app /app/app
COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN python -m grpc_tools.protoc -I/app/app/protos \
    --python_out=/app/app/protos \
    --grpc_python_out=/app/app/protos \
    /app/app/protos/glossary.proto
EXPOSE 50051
ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "-m", "app.grpc_server"]
