# This file defines the API routes related to the Orchestrator functionality. It includes a single POST endpoint /orchestrate that accepts
# a prompt and a list of providers, and returns the orchestrated response from the selected providers.

from fastapi import APIRouter
from pydantic import BaseModel

from orchestrator.orchestrate import run_orchestration

router = APIRouter(
    tags=["Orchestrator"] # swagger group name
)

# REQUEST MODEL
class PromptRequest(BaseModel):
    prompt: str
    # Multiple providers can be selected(if user selects only one provider, still the smart mode is not used then, we directly call the selected provider without routing logic)
    providers: list[str] = []


@router.post("/orchestrate") # POST /orchestrate
async def orchestrate(
    request: PromptRequest
):
    return await run_orchestration(
        request.prompt,
        request.providers
    )