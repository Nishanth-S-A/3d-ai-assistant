FROM ollama/ollama:latest

# Bake the model into the image layers
RUN ollama serve & \
    sleep 5 && \
    ollama pull gemma3:4b && \
    pkill ollama

ENTRYPOINT ["ollama", "serve"]