from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama
from agent.state import AgentState
from agent.tools import TOOLS
import os
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, SystemMessage

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)

llm_with_tools = llm.bind_tools(TOOLS)

def build_agent_graph():
    workflow = StateGraph(AgentState)

    def call_lc_agent(state):
        question = state["question"]
        try:
            system_prompt = ("""
                You are an AI assistant connected to a structured database (DB). 
                Your primary responsibility is to retrieve and generate responses strictly from the database content.

                -------------------------
                CORE BEHAVIOR RULES
                -------------------------

                1. Answering Questions
                - Always retrieve relevant information from the database before answering.
                - Base answers strictly on database content.
                - If the requested information is not available, respond with:
                "The requested information is not available in the database."
                - Do NOT use external knowledge.
                - Do NOT fabricate or assume missing details.

                2. Generating Questions
                - If the user asks to create questions, generate them strictly from database content.
                - Support formats such as:
                • Multiple Choice Questions
                • Short Answer Questions
                • Long Answer Questions
                • Quiz Sets
                - Ensure accuracy and alignment with stored data.

                3. Flashcards
                - If the user requests flashcards:
                • Generate Q&A style flashcards.
                • Keep them concise and clear.
                • Use only database information.

                4. Notes
                - If the user asks for notes:
                • Provide structured, organized notes.
                • Use headings and bullet points.
                • Include only database-derived information.

                5. Summaries
                - If the user asks for a summary:
                • Provide a concise and accurate summary.
                • Preserve key ideas.
                • Do not add external interpretations.

                -------------------------
                FORMAT GUIDELINES
                -------------------------

                - Use clean formatting.
                - Use headings where helpful.
                - Use bullet points or numbering when appropriate.
                - Adapt the format based on user request.

                -------------------------
                STRICT DATA DISCIPLINE
                -------------------------

                - Never introduce external facts.
                - Never speculate.
                - Never infer beyond database content.
                - Always remain grounded in stored data.

                -------------------------
                PRIMARY OBJECTIVE
                -------------------------

                Act as a structured study assistant that:
                - Retrieves from the database
                - Explains from the database
                - Generates study material from the database
                - Never goes beyond the database"
                        """)
            messages = [("system", system_prompt), ("user", question)]
            
            # Convert to LangChain message format
            lc_messages = []
            for msg in messages:
                if msg[0] == "system":
                    lc_messages.append(SystemMessage(content=msg[1]))
                elif msg[0] == "user":
                    lc_messages.append(HumanMessage(content=msg[1]))
                elif msg[0] == "assistant":
                    lc_messages.append(AIMessage(content=msg[1]))
                elif msg[0] == "tool":
                    lc_messages.append(ToolMessage(content=msg[1], tool_call_id=msg[2]))

            max_iterations = 5
            for i in range(max_iterations):
                print(f"\n--- [Iteration {i+1}/{max_iterations}] Calling Agent ---")
                response = llm_with_tools.invoke(lc_messages)
                lc_messages.append(response)
                
                if hasattr(response, 'tool_calls') and response.tool_calls:
                    for tool_call in response.tool_calls:
                        tool_name = tool_call['name']
                        tool_args = tool_call['args']
                        print(f" -> Agent requested tool: '{tool_name}' with args: {tool_args}")
                        # Find the tool function
                        tool_func = next((t for t in TOOLS if t.name == tool_name), None)
                        if tool_func:
                            try:
                                result = tool_func.invoke(tool_args)
                                result_str = str(result)
                                print(f" <- Tool '{tool_name}' returned {len(result_str)} characters.")
                                lc_messages.append(ToolMessage(content=result_str, tool_call_id=tool_call['id']))
                            except Exception as e:
                                print(f" <- Tool '{tool_name}' failed with error: {e}")
                                lc_messages.append(ToolMessage(content=f"Error: {e}", tool_call_id=tool_call['id']))
                        else:
                            print(f" <- Tool '{tool_name}' not found!")
                            lc_messages.append(ToolMessage(content="Tool not found", tool_call_id=tool_call['id']))
                else:
                    print(" -> Agent provided the final answer. Exiting loop.")
                    break
            
            # Get the final answer
            final_response = lc_messages[-1]
            answer_text = getattr(final_response, "content", "") or str(final_response)
            return {"answer": answer_text}

        except Exception as e:
            return {"answer": f"Agent error: {e}"}

    workflow.add_node("agent_node", call_lc_agent)
    workflow.set_entry_point("agent_node")
    workflow.add_edge("agent_node", END)

    return workflow.compile()
    
agent_graph = build_agent_graph()
