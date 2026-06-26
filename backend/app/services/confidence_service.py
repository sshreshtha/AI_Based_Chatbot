from app.config.settings import Settings
from app.models.response_models import ConfidenceResult
from app.models.retrieval_models import RetrievalQuality


class ConfidenceService:
    """Classifies retrieval confidence from hybrid retrieval quality."""

    def __init__(self, settings: Settings):
        self.settings = settings

    def evaluate(self, quality: RetrievalQuality) -> ConfidenceResult:
        score = quality.combined_confidence
        relevance = max(quality.keyword_score, quality.context_keyword_score)
        semantic_answer = quality.vector_score >= 0.78 and relevance >= 0.20
        if not quality.answerable or quality.weak_retrieval:
            return ConfidenceResult(label="low", score=score, ticket_required=True)
        if (
            score >= self.settings.high_confidence_threshold
            and relevance >= self.settings.min_high_confidence_keyword_score
        ):
            return ConfidenceResult(label="high", score=score, ticket_required=False)
        if score >= self.settings.medium_confidence_threshold or (semantic_answer and score >= 0.65):
            return ConfidenceResult(label="medium", score=score, ticket_required=False)
        return ConfidenceResult(label="low", score=score, ticket_required=True)
