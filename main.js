var className = 'gag-volume',
	timeClassName = 'gag-time',
	range = createRange(className),
	config = { childList: true, subtree: true },
	videos = document.querySelectorAll('.video-post');

initSetVolume();

setTimeout(function () {
	setRangeForEveryVideo();
}, 50);

var observer = new MutationObserver(function (list) {
	list.forEach(function (item) {
		changeVolume(getVolumeFromAttr());
		var className = item.target.className;
		if (className.length !== 0 && className.indexOf('video-post') >= 0) {
			var parent = item.target.parentNode.parentNode.parentNode;
			insertRange(parent, range);
			insertTimeRange(parent);
		}
	})
});

observer.observe(document.querySelector('#container'), config);

function createRange(className) {
	var range = document.createElement('input');

	range.setAttribute('class', className);
	range.setAttribute('type', 'range');
	range.setAttribute('min', 0);
	range.setAttribute('max', 100);

	return range;
}

function createTimeRange(duration) {
	var range = document.createElement('input');
	range.setAttribute('class', timeClassName);
	range.setAttribute('type', 'range');
	range.setAttribute('min', 0);
	range.setAttribute('max', Math.round(duration));
	range.setAttribute('value', 0);

	return range;
}

function createDurationTime(now, end) {
	var p = document.createElement('p');

	p.setAttribute('class', 'length');
	p.innerText = formatFullTime(now, end);

	return p;
}

function formatFullTime(now, end) {
	return formatTime(Math.floor(now)) + ' / ' + formatTime(Math.floor(end));
}

function formatTime(time) {
	return false === isNaN(time) ? (time - (time %= 60)) / 60+(9 < time ?':':':0') + time : ''
}

function insertRange(parent, range) {
	if (null === parent.parentNode.querySelector('.' + className)) {
		var toInsert = range.cloneNode(),
			soundButton = parent.querySelector('.sound-toggle'),
			parentCoords = parent.querySelector('a').getBoundingClientRect(),
			soundCoords = soundButton.getBoundingClientRect(),
			rangeWidth = 100;

		toInsert.setAttribute('value', getVolumeFromAttr());

		toInsert.style.top = soundCoords.bottom - (soundCoords.height / 1.8) - parentCoords.bottom - rangeWidth + 'px';
		toInsert.style.left = soundCoords.left - parentCoords.left - soundCoords.width - 10 + 'px';

		parent.querySelector('a').parentNode.appendChild(toInsert);
		changeVolume(getVolumeFromAttr());

		parent.parentNode.querySelector('.' + className)
			.addEventListener('change', function() {
				changeVolume(this.value);
				rangeChangeValue(className, this.value);
				setVolumeToStorage(this.value);
				setVolumeAttr(this.value);
		});

		soundButton.addEventListener('mouseover', function () {
			var range = parent.parentNode.querySelector('.' + className);
			if (parent.parentNode.parentNode.nodeName !== 'SECTION' && !range.getAttribute('flag')) {
				range.style.top = parseInt(range.style.top) + 6 + 'px';
				range.setAttribute('flag', '1');
			}
			range.style.display = 'block';
		});

		parent.parentNode.querySelector('.' + className).addEventListener('mouseout', function () {
			var range = parent.parentNode.querySelector('.' + className);
			range.style.display = 'none';
		})
	}
}

function insertTimeRange(parent) {
	if (null === parent.parentNode.querySelector('.' + timeClassName)) {
		var video = parent.querySelector('video');

		if (null !== video) {
			var range = createTimeRange(video.duration),
				length = parent.querySelector('.length');

			parent.querySelector('a').parentNode.appendChild(range);

			if (null !== length) {
				length.remove();
			}
			parent.querySelector('.video-post').appendChild(
				createDurationTime(this.value, video.duration)
			);

			parent.querySelector('video')
				.addEventListener('timeupdate', function () {
					this.parentNode.querySelector('.length').innerText = formatFullTime(
						this.currentTime,
						this.duration
					);

					var timeRange = this.parentNode.parentNode.parentNode.querySelector('.' + timeClassName);
					if (null !== timeRange) {
						timeRange.value = this.currentTime;
					}
				});

			parent.parentNode.querySelector('.' + timeClassName)
				.addEventListener('change', function() {
					var video = this.parentNode.querySelector('video');
					video.currentTime = this.value;
					video.play();
				});
			parent.parentNode.querySelector('.' + timeClassName)
				.addEventListener('input', function() {
					this.parentNode.querySelector('video').pause();
				});
		}
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

function setRangeForEveryVideo() {
	videos.forEach(function (video) {
		var parent = video.parentNode.parentNode.parentNode;
		insertRange(parent, range.cloneNode());
		insertTimeRange(parent);
	});
}

function setVolumeAttr(value) {
	document.querySelector('#container').setAttribute(className, value);
}

function getVolumeFromAttr() {
	return document.querySelector('#container').getAttribute(className);
}
