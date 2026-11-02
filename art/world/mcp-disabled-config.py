"""Local compatibility repair: pinned upstream omits its telemetry config.

All collection is unconditionally disabled. No telemetry endpoint or key is
configured. This intentionally cannot be enabled through addon preferences.
"""
from types import SimpleNamespace

telemetry_config = SimpleNamespace(
    enabled=False,
    max_prompt_length=0,
    supabase_url='',
    supabase_anon_key='',
    supabase_bucket='',
    timeout=1,
)
