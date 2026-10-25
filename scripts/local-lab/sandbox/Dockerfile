FROM node:24-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ gdb \
    && rm -rf /var/lib/apt/lists/*
LABEL org.algolab.sandbox.policy="1"
WORKDIR /app
COPY mi.cjs trace.cjs ./
COPY sandbox/worker.cjs ./worker.cjs
USER 10001:10001
ENV ALGOLAB_CONTAINER_WORKER=1
WORKDIR /tmp
ENTRYPOINT ["node", "/app/worker.cjs"]
