FROM python:3.12-slim

WORKDIR /sandbox

RUN useradd -ms /bin/bash sandboxuser

RUN chown -R sandboxuser:sandboxuser /sandbox

USER sandboxuser

CMD ["tail", "-f", "/dev/null"]