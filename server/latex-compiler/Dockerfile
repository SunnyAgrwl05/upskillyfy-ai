FROM debian:12-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates fontconfig libfontconfig1 libgraphite2-3 libharfbuzz0b libharfbuzz-icu0 libicu72 libssl3 zlib1g && rm -rf /var/lib/apt/lists/*
RUN cd /usr/local/bin && curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh
RUN useradd -m -u 1000 latex && mkdir -p /opt/tectonic-cache && chown latex /opt/tectonic-cache
ENV HOME=/home/latex XDG_CACHE_HOME=/opt/tectonic-cache
COPY warm.tex warm2.tex warm3.tex /tmp/
USER latex
RUN cd /tmp && tectonic warm.tex && (tectonic warm2.tex || true) && (tectonic warm3.tex || true)
USER root
RUN chmod -R a+rX /opt/tectonic-cache
USER 1000:1000
