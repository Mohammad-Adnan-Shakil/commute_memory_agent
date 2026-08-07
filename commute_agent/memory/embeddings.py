"""
Lightweight, dependency-free text embedding using feature hashing.
Works identically in any environment (local or deployed) with zero
external dependencies, zero cost, and zero network calls — unlike a
model-based embedding (e.g. Ollama), which requires a local runtime
that isn't available in the deployed environment.

This is not a semantic embedding in the neural-network sense, but it
is a legitimate, well-established embedding technique (the "hashing
trick") that provides meaningful vector similarity for texts sharing
words or phrases, which is sufficient for this application's use case:
recalling similar past route preferences.
"""

import hashlib
import re
import math

EMBEDDING_DIM = 768


def embed_text(text: str) -> list[float]:
    """
    Generates a deterministic 768-dimensional embedding for the given text
    using feature hashing over word tokens. Same input always produces the
    same output, and texts sharing words will have non-zero cosine similarity.
    """
    if not text or not text.strip():
        return [0.0] * EMBEDDING_DIM

    vector = [0.0] * EMBEDDING_DIM
    tokens = re.findall(r"[a-z0-9]+", text.lower())

    for token in tokens:
        hash_digest = hashlib.md5(token.encode("utf-8")).hexdigest()
        bucket = int(hash_digest, 16) % EMBEDDING_DIM
        sign = 1.0 if int(hash_digest, 16) % 2 == 0 else -1.0
        vector[bucket] += sign

    # L2 normalize so vector similarity comparisons are meaningful
    magnitude = math.sqrt(sum(v * v for v in vector))
    if magnitude > 0:
        vector = [v / magnitude for v in vector]

    return vector