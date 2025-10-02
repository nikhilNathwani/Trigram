import sys
sys.path.append('../utils')
from read_word_list import read_word_list
CORPUS_FILE_ROOT = "../../data/corpus/sowpods_"
CORPUS_FILE_SUFFIX= ".txt"

#output all trigrams that appear in words of length 4 through 15
def getWordsWithTrigram(trigram):
    trigram= trigram.upper()
    for i in range(4,16):
        CORPUS_FILE_PATH= CORPUS_FILE_ROOT + str(i) + CORPUS_FILE_SUFFIX
        word_list = read_word_list(CORPUS_FILE_PATH)
        print("~~~~~~~~   " + str(i) + " letter words   ~~~~~~~~")
        for word in word_list:
            if trigram in word:
                print(word)

        print("\n\n\n\n")
   
if len(sys.argv) > 1:
    input_trigram = sys.argv[1]
    getWordsWithTrigram(input_trigram)
else:
    print("No command-line argument provided.")