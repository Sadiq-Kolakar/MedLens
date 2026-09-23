from pydantic import BaseModel, Field

NOT_SPECIFIED = "Not specified in the abstract."


class TopicRelevance(BaseModel):
    status: str = ""
    justification: str = ""


class SummaryResult(BaseModel):
    title: str = NOT_SPECIFIED
    objective: str = NOT_SPECIFIED
    study_type: str = NOT_SPECIFIED
    population: str = NOT_SPECIFIED
    methodology: str = NOT_SPECIFIED
    key_findings: list[str] = Field(default_factory=list)
    clinical_or_research_relevance: str = NOT_SPECIFIED
    conclusion: str = NOT_SPECIFIED
    limitations: list[str] = Field(default_factory=list)
    topic_relevance: TopicRelevance = Field(default_factory=TopicRelevance)


class SummaryGenerationError(Exception):
    def __init__(self, user_message: str):
        self.user_message = user_message
        super().__init__(user_message)
