var className = 'gag-volume',
	range = createRange(className),
	config = { childList: true, subtree: true };

initSetVolume();

var observer = new MutationObserver(function (list) {
	list.forEach(function (item) {
		changeVolume(getVolumeFromAttr());
		var className = item.target.className;
		if (className.length !== 0 && className.indexOf('video-post') >= 0) {
			var parent = item.target.parentNode.parentNode.parentNode;
			insertRange(parent, range);
		}
	})
});

observer.observe(document.querySelector('.main-wrap'), config);

function createRange(className) {
	var range = document.createElement('input');

	range.setAttribute('class', className);
	range.setAttribute('type', 'range');
	range.setAttribute('min', 0);
	range.setAttribute('max', 100);

	return range;
}

function insertRange(parent, range) {
	if (parent.parentNode.querySelector('.gag-volume') === null) {
		var toInsert = range.cloneNode(),
			soundButton = parent.querySelector('.sound-toggle'),
			parentCoords = parent.getBoundingClientRect(),
			soundCoords = soundButton.getBoundingClientRect();

		toInsert.setAttribute('value', getVolumeFromAttr());
		toInsert.style.top = soundCoords.top - parentCoords.top - parentCoords.height + 5 + 'px';
		toInsert.style.left = soundCoords.left - parentCoords.left + soundCoords.width + 10 + 'px';

		parent.parentNode.insertBefore(toInsert, parent.nextSibling);
		changeVolume(getVolumeFromAttr());

		parent.parentNode.querySelector('.gag-volume')
			.addEventListener('change', function() {
				changeVolume(this.value);
				rangeChangeValue(className, this.value);
				setVolumeToStorage(this.value);
				setVolumeAttr(this.value);
		});

		soundButton.addEventListener('mouseover', function () {
			parent.parentNode.querySelector('.gag-volume').style.display = 'block';
		})
	}
}

function setVolumeToStorage(value) {
	chrome.storage.local.set({gagVolume: value});
}

function changeVolume(value) {
	var videos = document.querySelectorAll('.post-container video');

	videos.forEach(function (video) {
		video.volume = value / 100;
	});
}

function rangeChangeValue(className, value) {
	var ranges = document.querySelectorAll('.' + className);

	ranges.forEach(function (item) {
		item.value = value;
	})
}

function initSetVolume() {
	chrome.storage.local.get('gagVolume', function(result) {
		if (result.gagVolume !== undefined) {
			changeVolume(result.gagVolume);
			setVolumeAttr(result.gagVolume);
		} else {
			setVolumeAttr(100);
		}
		changeVolume(getVolumeFromAttr());
	});
}

function setVolumeAttr(value) {
	document.querySelector('.main-wrap').setAttribute(className, value);
}

function getVolumeFromAttr() {
	return document.querySelector('.main-wrap').getAttribute(className);
}