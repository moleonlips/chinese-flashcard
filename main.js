
let cards = [];
let currentCardIndex = -1;
let practiceCards = [];
let editingCardIndex = -1;

// Load cards from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    const storedCards = localStorage.getItem('chineseCards');
    if (storedCards) {
        cards = JSON.parse(storedCards);
    }
});

function showCreateCard() {
    document.getElementById('createCardSection').style.display = 'block';
    document.getElementById('cardListSection').style.display = 'none';
    document.getElementById('practiceSection').style.display = 'none';
}

function showCardList() {

    document.getElementById('createCardSection').style.display = 'none';
    document.getElementById('practiceSection').style.display = 'none';
    document.getElementById('cardListSection').style.display = 'block';

    // Populate card list
    const tableBody = document.getElementById('cardTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    cards = JSON.parse(localStorage.getItem('chineseCards')) || [];

    cards.forEach((card, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = card.chineseWord;
        row.insertCell(1).textContent = card.pinyin;
        row.insertCell(2).textContent = card.description;

        const actionsCell = row.insertCell(3);
        actionsCell.className = 'card-actions';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => openEditModal(index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteCard(index);

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    });

}

function createCard() {
    const chineseWord = document.getElementById('chineseWord').value.trim();
    const pinyin = document.getElementById('pinyin').value.trim();
    const description = document.getElementById('description').value.trim();

    // Check if all required fields are filled
    if (!chineseWord || !pinyin) {
        alert('Chinese word and pinyin are required!');
        return;
    }

    // Retrieve existing cards from localStorage
    cards = JSON.parse(localStorage.getItem('chineseCards')) || [];

    // Check if the Chinese word already exists
    const isDuplicate = cards.some(card => card.chineseWord.toLowerCase() === chineseWord.toLowerCase());

    if (isDuplicate) {
        // Show a confirmation dialog
        const confirmOverwrite = confirm(`The Chinese word "${chineseWord}" already exists. Do you want to add another card?`);

        if (!confirmOverwrite) {
            return; // Exit the function if user doesn't want to proceed
        }
    }
    else {

        // Create the new card
        const card = {
            chineseWord,
            pinyin,
            description,
        };

        // Add the new card to the array
        cards.push(card);

        // Save to local storage
        localStorage.setItem('chineseCards', JSON.stringify(cards));

        // Clear input fields
        document.getElementById('chineseWord').value = '';
        document.getElementById('pinyin').value = '';
        document.getElementById('description').value = '';

        // Show success message
        alert('Card created successfully!');
    }


    // Automatically show the updated card list
    showCreateCard();
}


function openEditModal(index) {

    const card = cards[index];
    editingCardIndex = index;

    document.getElementById('editChineseWord').value = card.chineseWord;
    document.getElementById('editPinyin').value = card.pinyin;
    document.getElementById('editDescription').value = card.description;

    document.getElementById('editModal').style.display = 'block';
}

function saveEditedCard() {
    if (editingCardIndex !== -1) {
        // Update the card in the cards array
        cards[editingCardIndex] = {
            chineseWord: document.getElementById('editChineseWord').value,
            pinyin: document.getElementById('editPinyin').value,
            description: document.getElementById('editDescription').value
        };

        // Save to local storage
        localStorage.setItem('chineseCards', JSON.stringify(cards));

        // Close modal and refresh card list
        closeEditModal();
        showCardList();
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingCardIndex = -1;
}

function deleteCard(index) {
    // Confirm deletion
    if (confirm('Are you sure you want to delete this card?')) {
        // Remove the card from the array
        cards.splice(index, 1);

        // Save updated cards to local storage
        localStorage.setItem('chineseCards', JSON.stringify(cards));

        // Refresh the card list
        showCardList();
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startPractice() {
    if (cards.length === 0) {
        alert('Please create some cards first!');
        return;
    }

    document.getElementById('createCardSection').style.display = 'none';
    document.getElementById('cardListSection').style.display = 'none';
    document.getElementById('practiceSection').style.display = 'block';

    // Create a copy of cards and shuffle
    practiceCards = shuffleArray([...cards]);

    currentCardIndex = 0;
    displayCurrentCard();
}

function displayCurrentCard() {
    const hintMessage = document.getElementById('hintMessage');
    hintMessage.innerHTML = '';

    if (practiceCards.length === 0) {
        // Reshuffle and restart when all cards have been practiced
        practiceCards = shuffleArray([...cards]);
        currentCardIndex = 0;
    }

    const card = practiceCards[currentCardIndex];
    document.getElementById('currentChineseWord').textContent = card.chineseWord;
    document.getElementById('pinyinInput').value = '';
    document.getElementById('resultMessage').textContent = '';

    // Update card progress
    document.getElementById('cardProgress').textContent =
        `Card ${currentCardIndex + 1} of ${cards.length}`;
}

function hintDesc() {
    const correctDesc = practiceCards[currentCardIndex].description.toLowerCase();
    const hintMessage = document.getElementById('hintMessage');
    hintMessage.innerHTML = correctDesc;
}

function checkPinyin() {
    const inputPinyin = document.getElementById('pinyinInput').value.toLowerCase();
    const correctPinyin = practiceCards[currentCardIndex].pinyin.toLowerCase();
    const resultMessage = document.getElementById('resultMessage');

    if (inputPinyin === correctPinyin) {
        resultMessage.textContent = 'Correct! Next card.';
        resultMessage.className = 'correct-message';

        // Remove the current card from practice cards
        practiceCards.splice(currentCardIndex, 1);

        // Adjust index if necessary
        if (currentCardIndex >= practiceCards.length) {
            currentCardIndex = 0;
        }

        // Show next card or reshuffle
        setTimeout(displayCurrentCard, 1000);
    } else {
        resultMessage.textContent = 'Incorrect. Try again!';
        resultMessage.className = 'incorrect-message';
    }
}