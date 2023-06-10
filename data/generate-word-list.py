
# Processing:
# 1) Choose a min word length for the game, call it m
# 2) Find longest word in word list, call its length M
# 3) Create 'words_length_N' sqlite tables for N= m to M
# 4) Add each word W from word list into 'words_length_[len(W)]' IF len(W)>=m
# 5) Create 'trigrams' table w/ columns called 'run_start', 'run_length',
#    'used_in_game', and 'num_words_length_N' for each N= m to M
# 6) Do Step (7) for each N from m to M
# 7) Do Step (8) for each word W in 'words_length_N' table
# 8) Do Step (9) for each trigram T contained in W
# 9) A) If T not in 'trigrams' table:
#         - Add T, with 'num_words_length_N'=1, 'run_start'=N, 'run_length'=1
#    B) Else (T already in 'trigrams' table):
#         - Increment 'num_words_length_N' by 1
#         - Increment 'run_length' IF it currently equals (N - 'run_start')


# Temp solution:
import urllib.request
import json

def download_scrabble_word_list():
    url = "https://www.wordgamedictionary.com/twl06/download/twl06.txt"
    filename = "scrabble_words.txt"
    urllib.request.urlretrieve(url, filename)

def generate_words_with_cat(n):
    with open("scrabble_words.txt", "r") as file:
        cat_words = [word.strip() for word in file.readlines() if 'cat' in word.lower()]
    n_letter_words = [word for word in cat_words if len(word) == n]
    return n_letter_words

n_values = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
json_data = {}

download_scrabble_word_list()

for n in n_values:
    words_with_cat = generate_words_with_cat(n)
    json_data[str(n)] = words_with_cat

with open('cat_words.json', 'w') as json_file:
    json.dump(json_data, json_file, indent=2)
