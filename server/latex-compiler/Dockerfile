FROM debian:13-slim
ENV DEBIAN_FRONTEND=noninteractive
# tectonic's drop installer only ships glibc binaries for x86_64; on aarch64
# the release assets are musl-only, so pick the build that matches this
# architecture. The musl build is static and runs fine on glibc systems too.
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates fontconfig libfontconfig1 libgraphite2-3 libharfbuzz0b libharfbuzz-icu0 libssl3t64 zlib1g \
      fonts-stix fonts-liberation fonts-dejavu-core fonts-noto-core \
    && find /var/lib/apt/lists -type f -delete
# Install tectonic by architecture: the drop installer only serves a
# x86_64-unknown-linux-gnu build, while the 0.17.0 aarch64 release is musl-only,
# so pick the correct asset explicitly instead of relying on the installer.
RUN set -eux; \
    arch="$(uname -m)"; \
    case "$arch" in \
      x86_64) asset="tectonic-0.17.0-x86_64-unknown-linux-gnu.tar.gz" ;; \
      aarch64) asset="tectonic-0.17.0-aarch64-unknown-linux-musl.tar.gz" ;; \
      *) echo "unsupported architecture: $arch" >&2; exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.17.0/${asset}" \
      | tar -xz -C /usr/local/bin tectonic; \
    tectonic --version
RUN useradd -m -u 1000 latex && mkdir -p /opt/tectonic-cache && chown latex /opt/tectonic-cache
ENV HOME=/home/latex XDG_CACHE_HOME=/opt/tectonic-cache
COPY --chmod=644 warm.tex warm2.tex warm3.tex warm4.tex warm5.tex warm6.tex /tmp/
USER latex
RUN cd /tmp && tectonic warm.tex && (tectonic warm2.tex || true) && (tectonic warm3.tex || true) && (tectonic warm4.tex || true) && (tectonic warm5.tex || true) && (tectonic warm6.tex || true)
RUN cd /tmp && for p in xcolor titlesec tabularx array fancyhdr parskip multicol setspace ragged2e graphicx tikz pgf fontawesome5 fontawesome academicons marvosym lmodern helvet mathptmx charter palatino tgheros tgpagella tgtermes libertine microtype babel inputenc textcomp url cmap booktabs longtable multirow calc ifthen etoolbox changepage tabto paracol csquotes soul ulem listings amsmath amssymb fullpage cfr-lm roboto sourcesanspro hyperref enumitem geometry float wrapfig caption subcaption xparse xifthen pifont bbding tcolorbox hyphenat marginnote lastpage anyfontsize fontspec framed mdframed paralist xspace textpos eso-pic; do \
  printf '\\documentclass[10pt,a4paper]{article}\\usepackage[T1]{fontenc}\\usepackage{%s}\\begin{document}{\\tiny a}{\\small a}{\\large \\textbf{a}}{\\Large \\textbf{a}}{\\LARGE \\textbf{a}}{\\huge \\textbf{a}}\\textit{a}\\textsc{a}\\textsf{a}\\texttt{a}\\end{document}\n' "$p" > w_$p.tex; \
  tectonic w_$p.tex >/dev/null 2>&1 && echo "OK $p" || echo "SKIP $p"; \
done
USER root
RUN chmod -R a+rX /opt/tectonic-cache
# Prove the Unicode font pipeline inside the image: fontspec must resolve a real
# installed OpenType family (Debian fonts-stix registers "STIXGeneral") and the
# compile log must contain no "Missing character" warnings for U+2014/U+2013/U+201C.
RUN set -eu; \
    printf '\\documentclass[10pt]{article}\\usepackage{fontspec}\\setmainfont{STIXGeneral}\\begin{document}dash — en – quote “x” bullet •\\end{document}\n' > /tmp/fontspec-check.tex; \
    tectonic /tmp/fontspec-check.tex > /tmp/fontspec.log 2>&1; \
    if grep -q 'Missing character' /tmp/fontspec.log; then \
      echo 'Unicode glyphs missing from main font' >&2; cat /tmp/fontspec.log >&2; exit 1; \
    fi; \
    test -s /tmp/fontspec-check.pdf
USER 1000:1000
