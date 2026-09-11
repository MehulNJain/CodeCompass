from app.core.security import (
    hash_password,
    hash_session_token,
    new_session_token,
    password_needs_rehash,
    verify_password,
)

PASSWORD = "correct horse battery"


def test_a_password_verifies_against_its_own_hash_only() -> None:
    password_hash = hash_password(PASSWORD)
    assert password_hash.startswith("$argon2id$")
    assert verify_password(PASSWORD, password_hash)
    assert not verify_password("Correct horse battery", password_hash)


def test_hashes_are_salted() -> None:
    assert hash_password(PASSWORD) != hash_password(PASSWORD)


def test_a_missing_or_corrupt_hash_never_verifies() -> None:
    assert not verify_password(PASSWORD, None)
    assert not verify_password(PASSWORD, "not-an-argon2-hash")


def test_a_fresh_hash_does_not_need_rehashing() -> None:
    assert not password_needs_rehash(hash_password(PASSWORD))


def test_session_tokens_are_unique_and_carry_256_bits() -> None:
    tokens = {new_session_token() for _ in range(100)}
    assert len(tokens) == 100
    # 32 bytes, base64url without padding.
    assert all(len(token) == 43 for token in tokens)


def test_the_stored_token_hash_is_stable_and_is_not_the_token() -> None:
    token = new_session_token()
    assert hash_session_token(token) == hash_session_token(token)
    assert hash_session_token(token) != token
    assert len(hash_session_token(token)) == 64
