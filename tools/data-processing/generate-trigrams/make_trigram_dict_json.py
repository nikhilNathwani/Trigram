import sys
import json
sys.path.append('../../utils')
from read_word_list import read_word_list
CORPUS_FILE_ROOT = "../../../data/dictionaries/sowpods_"
CORPUS_FILE_SUFFIX= ".txt"
OUTPUT_FILE_ROOT= "../../../data/game-data/"
OUTPUT_FILE_SUFFIX= "_words.json"

#output all trigrams that appear in words of length 4 through 15
def getWordsWithTrigramByLength(trigram):
    word_dict= {}
    trigram= trigram.upper()
    for length in range(4,16):
        CORPUS_FILE_PATH= CORPUS_FILE_ROOT + str(length) + CORPUS_FILE_SUFFIX
        word_list = read_word_list(CORPUS_FILE_PATH)
        # print("~~~~~~~~   " + str(length) + " letter words   ~~~~~~~~")
        for word in word_list:
            if trigram in word:
                if length in word_dict:
                    word_dict[length].append(word)
                else:
                    word_dict[length] = [word]
        # print("\n\n\n\n")
    with open(OUTPUT_FILE_ROOT + trigram.lower() + OUTPUT_FILE_SUFFIX, 'w') as file:
        json.dump(word_dict, file, indent=4)
   
if len(sys.argv) > 1:
    input_trigram = sys.argv[1]
    print(f"Generating word dictionary for trigram: {input_trigram.upper()}")
    getWordsWithTrigramByLength(input_trigram)
    print(f"✅ Created {input_trigram.lower()}_words.json")
else:
    print("No command-line argument provided.")
    print("Usage: python make_trigram_dict_json.py <TRIGRAM>")