import sys
sys.path.append('../choose-trigram')
from read_word_list import read_word_list
CORPUS_FILE_PATH = "../../data/corpus/sowpods.txt"
OUTPUT_FILE_ROOT = "../../data/corpus/sowpods_"

def getAllWordsOfLength(length):
    word_list = read_word_list(CORPUS_FILE_PATH)
    words_of_length= []
    for word in word_list:
        if len(word) == length:
            words_of_length.append(word)
    return sorted(words_of_length)

try:
    for i in range(4,16):
        OUTPUT_FILE_PATH= OUTPUT_FILE_ROOT+str(i)+".txt"
        with open(OUTPUT_FILE_PATH, 'w') as output_file:
            for word in getAllWordsOfLength(i):
                output_file.write(word + '\n')
        print(f"All words of length {i} written to {OUTPUT_FILE_PATH}")

except Exception as e:
    print(f"An error occurred: {e}")
