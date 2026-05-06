import functools
import hashlib
import json
from pathlib import Path
from typing import Callable, TypeVar

import diskcache

_CACHE_DIR = Path(__file__).parent.parent / ".cache"
_cache = diskcache.Cache(_CACHE_DIR)

# 24 hours — shot data for past games never changes
_TTL = 60 * 60 * 24

F = TypeVar("F", bound=Callable)


def cached(ttl: int = _TTL) -> Callable[[F], F]:
    """Decorator that caches a function's return value to disk by its arguments."""

    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = hashlib.md5(
                json.dumps({"fn": fn.__qualname__, "args": args, "kwargs": kwargs}, sort_keys=True).encode()
            ).hexdigest()
            if key in _cache:
                return _cache[key]
            result = fn(*args, **kwargs)
            _cache.set(key, result, expire=ttl)
            return result

        return wrapper  # type: ignore[return-value]

    return decorator
