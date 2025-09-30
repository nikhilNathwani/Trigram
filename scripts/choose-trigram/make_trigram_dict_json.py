import sys
import json
from read_word_list import read_word_list
CORPUS_FILE_ROOT = "../../data/corpus/sowpods_"
CORPUS_FILE_SUFFIX= ".txt"
OUTPUT_FILE_ROOT= "../../data/trigrams/"
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
    getWordsWithTrigramByLength(input_trigram)
else:
    print("No command-line argument provided.")