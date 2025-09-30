import sys
sys.path.append('../choose-trigram')
from read_word_list import read_word_list
CORPUS_FILE_PATH = "../../data/corpus/sowpods.txt"
TRIGRAM_FILE_PATH = "../../data/corpus/all_trigrams.txt"
OUTPUT_FILE_PATH = "../../data/corpus/all_trigrams_4_to_15.txt"

#output all trigrams that appear in words of length 4 through 15
def allTrigrams4to15():
    word_list = read_word_list(CORPUS_FILE_PATH)
    trigram_list = read_word_list(TRIGRAM_FILE_PATH)
    trigram_wordLengths= {}
    trigram_4to15= []

    for trigram in trigram_list:
        for i in range(4,16):
            foundWord= False
            for word in word_list:
                if len(word) != i:
                    continue
                if trigram in word:
                    foundWord= True
                    break
            if foundWord == False:
                print(trigram, "NO")
                break
            if i==15:
                print(trigram, "YES")
                trigram_4to15.append(trigram)
    return trigram_4to15

try:
    trigrams_4to15 = allTrigrams4to15()
    with open(OUTPUT_FILE_PATH, 'w') as output_file:
        for trigram in trigrams_4to15:
            output_file.write(trigram + '\n')
    print(f"All trigrams in words of length 4 through 15 written to {OUTPUT_FILE_PATH}")

except Exception as e:
    print(f"An error occurred: {e}")