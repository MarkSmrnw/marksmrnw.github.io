/**
 * turnierbaum.js - Populates the tournament bracket with match data from results.json
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fetch the results data
    fetch('src/data/results.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateTournamentBracket(data);
            drawConnectingLines();
        })
        .catch(error => {
            console.error('Error loading tournament data:', error);
        });
});

/**
 * Populates the tournament bracket with match data
 * @param {Object} data - The tournament data from results.json
 */
function populateTournamentBracket(data) {
    const rounds = data.rounds;
    
    // Map the round data to the HTML structure
    // Round 1 - Quarterfinals (rounds[0])
    if (rounds.length > 0 && rounds[0].matches) {
        updateRoundTitle(1, rounds[0].round_name);
        populateRound(1, rounds[0].matches);
    }
    
    // Round 2 - Semifinals (rounds[1])
    if (rounds.length > 1 && rounds[1].matches) {
        updateRoundTitle(2, rounds[1].round_name);
        populateRound(2, rounds[1].matches);
    }
    
    // Round 3 - Finals (rounds[2])
    if (rounds.length > 2 && rounds[2].matches) {
        updateRoundTitle(3, rounds[2].round_name);
        populateRound(3, rounds[2].matches);
    }
    
    // Winner (rounds[3])
    if (rounds.length > 3 && rounds[3].matches && rounds[3].matches.length > 0) {
        const finalsMatch = rounds[3].matches[0];
        const winnerElement = document.querySelector('#match-winner .participant');
        
        if (winnerElement && finalsMatch.winner && finalsMatch.winner !== "TBD") {
            winnerElement.textContent = finalsMatch.winner;
            winnerElement.classList.remove('placeholder');
        }
    }
}

/**
 * Updates the title of a round
 * @param {number} roundNumber - The round number
 * @param {string} title - The new title for the round
 */
function updateRoundTitle(roundNumber, title) {
    const roundTitleElement = document.querySelector(`#round-${roundNumber} .round-title`);
    if (roundTitleElement && title) {
        roundTitleElement.textContent = title;
    }
}

/**
 * Populates a single round with match data
 * @param {number} roundNumber - The round number
 * @param {Array} matches - The matches for this round
 */
function populateRound(roundNumber, matches) {
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const matchElement = document.querySelector(`#match-${roundNumber}-${i+1}`);
        
        if (matchElement) {
            const participants = matchElement.querySelectorAll('.participant');
            
            // Update team names
            if (participants.length >= 2) {
                // Team 1
                if (match.team1 && match.team1 !== "TBD") {
                    participants[0].textContent = match.team1;
                    participants[0].classList.remove('placeholder');
                    
                    // Add goals if available
                    if (match.team1_goals !== undefined) {
                        const goalSpan = document.createElement('span');
                        goalSpan.classList.add('team-goals');
                        goalSpan.textContent = match.team1_goals;
                        participants[0].appendChild(goalSpan);
                    }
                }
                
                // Team 2
                if (match.team2 && match.team2 !== "TBD") {
                    participants[1].textContent = match.team2;
                    participants[1].classList.remove('placeholder');
                    
                    // Add goals if available
                    if (match.team2_goals !== undefined) {
                        const goalSpan = document.createElement('span');
                        goalSpan.classList.add('team-goals');
                        goalSpan.textContent = match.team2_goals;
                        participants[1].appendChild(goalSpan);
                    }
                }
                
                // Apply appropriate styles if a winner is determined
                if (match.winner && match.winner !== "TBD") {
                    // Apply a grayish background to the match to indicate it's completed
                    matchElement.classList.add('match-completed');
                    
                    // Highlight the winner
                    const winnerIndex = match.winner === match.team1 ? 0 : 1;
                    participants[winnerIndex].classList.add('match-winner');
                }
            }
        }
    }
}

/**
 * Draws connecting lines between matches in the tournament bracket
 */
function drawConnectingLines() {
    const svgElement = document.getElementById('tournamentLinesSvg');
    if (!svgElement) return;
    
    // Clear any existing lines
    svgElement.innerHTML = '';
    
    // Connect round 1 to round 2 (quarterfinals to semifinals)
    connectMatchups(1, 1, 2, 1); // Match 1-1 and Match 1-2 to Match 2-1
    connectMatchups(1, 3, 2, 2); // Match 1-3 and Match 1-4 to Match 2-2
    
    // Connect round 2 to round 3 (semifinals to finals)
    connectMatchups(2, 1, 3, 1); // Match 2-1 and Match 2-2 to Match 3-1
    
    // Connect finals to winner
    connectFinalToWinner(3, 1);
}

/**
 * Connects two matchups from one round to the next round
 * @param {number} fromRound - The source round number
 * @param {number} fromMatchStart - The first match number in the source round
 * @param {number} toRound - The target round number
 * @param {number} toMatch - The match number in the target round
 */
function connectMatchups(fromRound, fromMatchStart, toRound, toMatch) {
    const match1 = document.getElementById(`match-${fromRound}-${fromMatchStart}`);
    const match2 = document.getElementById(`match-${fromRound}-${fromMatchStart + 1}`);
    const targetMatch = document.getElementById(`match-${toRound}-${toMatch}`);
    
    if (!match1 || !match2 || !targetMatch) return;
    
    const svgElement = document.getElementById('tournamentLinesSvg');
    
    // Calculate positions
    const rect1 = match1.getBoundingClientRect();
    const rect2 = match2.getBoundingClientRect();
    const targetRect = targetMatch.getBoundingClientRect();
    
    // Convert to SVG coordinates
    const svgRect = svgElement.getBoundingClientRect();
    
    // Draw lines from match1 to targetMatch
    drawLine(
        svgElement,
        rect1.right - svgRect.left,
        rect1.top + rect1.height / 2 - svgRect.top,
        targetRect.left - svgRect.left,
        targetRect.top + targetRect.height / 4 - svgRect.top
    );
    
    // Draw lines from match2 to targetMatch
    drawLine(
        svgElement,
        rect2.right - svgRect.left,
        rect2.top + rect2.height / 2 - svgRect.top,
        targetRect.left - svgRect.left,
        targetRect.top + (targetRect.height * 3) / 4 - svgRect.top
    );
}

/**
 * Connects the finals to the winner box
 * @param {number} fromRound - The finals round number
 * @param {number} fromMatch - The finals match number
 */
function connectFinalToWinner(fromRound, fromMatch) {
    const match = document.getElementById(`match-${fromRound}-${fromMatch}`);
    const winnerBox = document.getElementById(`match-winner`);
    
    if (!match || !winnerBox) return;
    
    const svgElement = document.getElementById('tournamentLinesSvg');
    
    // Calculate positions
    const rect = match.getBoundingClientRect();
    const winnerRect = winnerBox.getBoundingClientRect();
    
    // Convert to SVG coordinates
    const svgRect = svgElement.getBoundingClientRect();
    
    // Draw line from finals to winner
    drawLine(
        svgElement,
        rect.right - svgRect.left,
        rect.top + rect.height / 2 - svgRect.top,
        winnerRect.left - svgRect.left,
        winnerRect.top + winnerRect.height / 2 - svgRect.top
    );
}

/**
 * Helper function to draw a line in the SVG
 * @param {SVGElement} svg - The SVG element
 * @param {number} x1 - Starting x coordinate
 * @param {number} y1 - Starting y coordinate
 * @param {number} x2 - Ending x coordinate
 * @param {number} y2 - Ending y coordinate
 */
function drawLine(svg, x1, y1, x2, y2) {
    const midX = (x1 + x2) / 2;
    
    // Create the horizontal and vertical lines for the connection
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', x1);
    line1.setAttribute('y1', y1);
    line1.setAttribute('x2', midX);
    line1.setAttribute('y2', y1);
    line1.setAttribute('stroke', 'var(--text-color)');
    line1.setAttribute('stroke-width', '2');
    
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', midX);
    line2.setAttribute('y1', y1);
    line2.setAttribute('x2', midX);
    line2.setAttribute('y2', y2);
    line2.setAttribute('stroke', 'var(--text-color)');
    line2.setAttribute('stroke-width', '2');
    
    const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line3.setAttribute('x1', midX);
    line3.setAttribute('y1', y2);
    line3.setAttribute('x2', x2);
    line3.setAttribute('y2', y2);
    line3.setAttribute('stroke', 'var(--text-color)');
    line3.setAttribute('stroke-width', '2');
    
    svg.appendChild(line1);
    svg.appendChild(line2);
    svg.appendChild(line3);
}

// Redraw lines on window resize
window.addEventListener('resize', function() {
    drawConnectingLines();
});