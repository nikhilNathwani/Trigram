CORPUS_FILE_PATH = "../../data/dictionaries/sowpods.txt"
FREQUENCY_FILE_PATH = "../../data/dictionaries/word_frequency.txt"

def read_word_list(path):
    try:    
        with open(path, 'r') as file:
            return set(line.strip() for line in file)
    except FileNotFoundError:
        print(f"Error: File not found at {path}") 
    except Exception as e:
        print(f"An error occurred: {e}")

def read_word_frequency_list():
    with open(FREQUENCY_FILE_PATH, 'r') as file:
        # Read the lines and remove leading/trailing whitespace
        word_frequency_list = [line.strip() for line in file]
    return word_frequency_list