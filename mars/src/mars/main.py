#!/usr/bin/env python
import sys
import warnings
import re
from datetime import datetime

from mars.crew import Mars

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

def run():
    """
    Run the crew.
    """
    print("TO END CONVERSATION..type this --> end/bye")
    print("Whats the topic you want to conduct your research on?")
    print("Type below:")

    while True:
        user_topic = input()
        if user_topic.lower() in ["exit","end","exit/bye","end/bye"]:
            print("Thank you")
            break
        inputs = {
            'topic': user_topic,
            'current_year': str(datetime.now().year),
            'timestamp': datetime.now().strftime("%d-%m-%Y_%H-%M-%S"),
            'safe_topic': re.sub(r'[^\w_]', '', user_topic.replace(' ', '_'))
            }
            
        try:
            Mars().crew().kickoff(inputs=inputs)
        except Exception as e:
            raise Exception(f"An error occurred while running the crew: {e}")