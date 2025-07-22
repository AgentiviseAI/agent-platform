"""
LLM API endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import LLM, LLMCreate, LLMUpdate, ListResponse
from app.services import LLMService
from app.api.dependencies import get_llm_service, verify_token
from app.core.exceptions import NotFoundError, ConflictError

router = APIRouter(prefix="/llms", tags=["LLMs"])


@router.get("", response_model=ListResponse)
async def list_llms(
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """List all LLMs"""
    llms = llm_service.get_all_llms()
    return ListResponse(items=llms, total=len(llms))


@router.post("", response_model=LLM, status_code=status.HTTP_201_CREATED)
async def create_llm(
    llm: LLMCreate,
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Create a new LLM configuration"""
    try:
        llm_data = llm.dict()
        created_llm = llm_service.create_llm(**llm_data)
        return created_llm
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/{llm_id}", response_model=LLM)
async def get_llm(
    llm_id: str,
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Get a specific LLM"""
    try:
        llm = llm_service.get_llm(llm_id)
        return llm
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{llm_id}", response_model=LLM)
async def update_llm(
    llm_id: str,
    llm: LLMUpdate,
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Update LLM configuration"""
    try:
        llm_data = llm.dict(exclude_unset=True)
        updated_llm = llm_service.update_llm(llm_id, **llm_data)
        return updated_llm
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{llm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_llm(
    llm_id: str,
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Delete an LLM configuration"""
    try:
        llm_service.delete_llm(llm_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{llm_id}/test", response_model=dict)
async def test_llm_connection(
    llm_id: str,
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Test LLM connection and availability"""
    try:
        result = llm_service.test_llm_connection(llm_id)
        return {"status": "success", "result": result}
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Connection test failed: {str(e)}")


@router.get("/{llm_id}/usage", response_model=dict)
async def get_llm_usage_stats(
    llm_id: str,
    token: str = Depends(verify_token),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Get LLM usage statistics"""
    try:
        usage_stats = llm_service.get_llm_usage_stats(llm_id)
        return {"llm_id": llm_id, "usage_stats": usage_stats}
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
