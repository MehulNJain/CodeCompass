"""Domain exceptions.

Routes raise these instead of HTTPException so that the analysis pipeline stays
free of any web framework. `app.main` translates them into HTTP responses.
"""


class CodeCompassError(Exception):
    """Base class for every error this application raises deliberately."""

    status_code = 500
    message = "Something went wrong."

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)
        self.message = message or self.message


class NotFoundError(CodeCompassError):
    status_code = 404
    message = "The requested resource does not exist."


class ValidationError(CodeCompassError):
    status_code = 422
    message = "The request was not valid."


class ConflictError(CodeCompassError):
    status_code = 409
    message = "That conflicts with the current state."


class NotImplementedYetError(CodeCompassError):
    """A planned endpoint whose module has not been built.

    Better than a 404: it tells the frontend the route is real and the feature
    is coming, rather than implying a typo in the URL.
    """

    status_code = 501
    message = "Not implemented yet."


class ExternalServiceError(CodeCompassError):
    status_code = 502
    message = "A service this depends on is unavailable."
