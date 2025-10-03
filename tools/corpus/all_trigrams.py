import sys
sys.path.append('../utils')
from read_word_list import read_word_list
CORPUS_FILE_PATH = "../../data/corpus/sowpods.txt"
OUTPUT_FILE_PATH = "../../data/corpus/all_trigrams.txt"

def getAllTrigrams():
    trigram_set= set()
    word_list = read_word_list(CORPUS_FILE_PATH)
    for word in word_list:
        if len(word) < 4:
            continue
        for i in range(len(word)-2):
            print(word)
            print(word[i:i+3])
            trigram_set.add(word[i:i+3])    
    return sorted(trigram_set)

try:
    all_trigrams = getAllTrigrams()
    with open(OUTPUT_FILE_PATH, 'w') as output_file:
        for trigram in all_trigrams:
            output_file.write(trigram + '\n')
    print(f"All trigrams written to {OUTPUT_FILE_PATH}")

except Exception as e:
    print(f"An error occurred: {e}")
