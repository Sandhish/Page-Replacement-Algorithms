document.getElementById('pageForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const sequence = document.getElementById('sequence').value.split(',').map(Number);
    const frameSize = parseInt(document.getElementById('frameSize').value);
    const algorithm = document.getElementById('algorithm').value;

    let result;
    if (algorithm === 'fifo') {
        result = fifo(sequence, frameSize);
    } else if (algorithm === 'lru') {
        result = lru(sequence, frameSize);
    } else if (algorithm === 'optimal') {
        result = optimal(sequence, frameSize);
    }

    displayResults(result);
});

function displayResults(result) {
    const [frame, pageFaults, pattern, steps] = result;

    document.getElementById('finalFrame').textContent = 'Final Frame: ' + frame.join(', ');
    document.getElementById('pageFaults').textContent = 'Page Faults: ' + pageFaults;
    document.getElementById('pattern').textContent = 'Pattern: ' + pattern;

    const stepsContainer = document.createElement('div');
    stepsContainer.innerHTML = '<h2>Steps:</h2>';
    document.getElementById('results').appendChild(stepsContainer);

    let stepIndex = 0;

    function displayStep() {
        if (stepIndex < steps.length) {
            const stepElement = document.createElement('p');
            stepElement.textContent = steps[stepIndex];
            stepsContainer.appendChild(stepElement);
            stepIndex++;
            setTimeout(displayStep, 1000); 
        }
    }
    displayStep();
}

// FIFO Page Replacement
function fifo(sequence, frameSize) {
    let frame = Array(frameSize).fill(-1);
    let pageFaults = 0;
    let findex = 0;
    let pattern = "";
    let steps = [];

    function inFrame(page) {
        return frame.includes(page);
    }

    for (let page of sequence) {
        if (!inFrame(page)) {
            pageFaults++;
            frame[findex] = page;
            findex = (findex + 1) % frameSize;
            pattern += "Y ";
        } else {
            pattern += "N ";
        }
        steps.push(`Frame: ${frame.join(', ')} | Page: ${page}`);
    }

    return [frame, pageFaults, pattern, steps];
}

// LRU Page Replacement
function lru(sequence, frameSize) {
    let frame = Array(frameSize).fill(-1);
    let pageFaults = 0;
    let pattern = "";
    let steps = [];
    let recent = [];

    function inFrame(page) {
        return frame.includes(page);
    }

    function indexToRemove() {
        return recent.shift();
    }

    for (let page of sequence) {
        if (!inFrame(page)) {
            if (frame.includes(-1)) {
                frame[frame.indexOf(-1)] = page;
            } else {
                const idx = indexToRemove();
                frame[idx] = page;
            }
            pageFaults++;
            pattern += "Y ";
        } else {
            pattern += "N ";
            recent.splice(recent.indexOf(frame.indexOf(page)), 1);
        }
        recent.push(frame.indexOf(page));
        steps.push(`Frame: ${frame.join(', ')} | Page: ${page}`);
    }

    return [frame, pageFaults, pattern, steps];
}

// Optimal Page Replacement
function optimal(sequence, frameSize) {
    let frame = Array(frameSize).fill(-1);
    let pageFaults = 0;
    let pattern = "";
    let steps = [];

    function inFrame(page) {
        return frame.includes(page);
    }

    function indexToRemove(currentIndex) {
        let futureIndices = frame.map(page => sequence.slice(currentIndex + 1).indexOf(page));
        futureIndices = futureIndices.map(idx => idx === -1 ? Infinity : idx);
        return futureIndices.indexOf(Math.max(...futureIndices));
    }

    for (let index = 0; index < sequence.length; index++) {
        let page = sequence[index];
        if (!inFrame(page)) {
            if (frame.includes(-1)) {
                frame[frame.indexOf(-1)] = page;
            } else {
                const idx = indexToRemove(index);
                frame[idx] = page;
            }
            pageFaults++;
            pattern += "Y ";
        } else {
            pattern += "N ";
        }
        steps.push(`Frame: ${frame.join(', ')} | Page: ${page}`);
    }

    return [frame, pageFaults, pattern, steps];
}
