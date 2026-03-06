import google.generativeai as genai

genai.configure(api_key="AIzaSyDm8naEeY_C0E9H17jtYrGAI6R_UZSIlA0")

models = genai.list_models()
for m in models:
    print(m.name)