import sys
from read_word_list import read_word_list, read_word_frequency_list
CORPUS_FILE_ROOT = "../../data/corpus/sowpods_"
CORPUS_FILE_SUFFIX= ".txt"

word_frequency_list = read_word_frequency_list()

#output all trigrams that appear in words of length 4 through 15
def getWordsWithTrigram(trigram):
    trigram= trigram.upper()
    for i in range(4,16):
        CORPUS_FILE_PATH= CORPUS_FILE_ROOT + str(i) + CORPUS_FILE_SUFFIX
        word_list = read_word_list(CORPUS_FILE_PATH)
        print("~~~~~~~~   " + str(i) + " letter words   ~~~~~~~~")
        
        #sort the words based on how common they are
        word_frequency_dict = {word: word_frequency_list.index(word.upper()) + 1 if word.upper() in word_frequency_list else 100000 for word in word_list}
        sorted_words = sorted(word_list, key=lambda word: word_frequency_dict[word])

        #print top 20 most common words
        printCount= 0
        printMax= 20
        for word in sorted_words:
            if trigram in word and printCount < printMax:
                print(word)
                printCount+= 1

        print("\n\n\n\n")
   
if len(sys.argv) > 1:
    input_trigram = sys.argv[1]
    getWordsWithTrigram(input_trigram)
else:
    print("No command-line argument provided.")