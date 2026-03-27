FROM ollama/ollama:latest

# Bake the model into the image layers
RUN ollama serve & \
    sleep 5 && \
    ollama pull llama3.2 && \
    pkill ollama

ENTRYPOINT ["ollama", "serve"]