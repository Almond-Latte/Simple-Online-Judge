FROM python:3.12-slim

WORKDIR /sandbox

RUN useradd -ms /bin/bash sandboxuser

RUN chown -R sandboxuser:sandboxuser /sandbox

USER sandboxuser

CMD ["python3", "script.py"]