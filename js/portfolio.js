$(document).ready(function(){

	var screenWidth = window.innerWidth;
	var ACTIVE_CLASS = "_active";


	function print (string) {
		console.log(string);
	}

	function printObj ($obj) {
		print("PRINT OBJECT: "+$obj);
		for(var key in $obj) {
		    print(key + ': ' + $obj[key]);
		}
	}
 
	/* PIECE CAROUSEL */

	var IMAGE_CHANGE_THRESHOLD = Math.min(100, screenWidth*.2); // Number of pixels a swipe must pass to change focus to the next image
	var SWIPE_THRESHOLD = 50;

	var activeIndex = 0, $activeImage = null, activeFocusPoint = 0, rightFocusPoint = null, leftFocusPoint = null,
		changeActiveImage = false, imageSetCount = 0, startPosition = 0, prevDistance = 0,  initalDirection = null, currDirection;

	// TODO: Ignore images/thumbnails that are already active
	// TODO: Add arrow keyboard control
	// TODO: Add numeric keyboard control (treat it like chrome tabs where 1 = first image, ... , 9 = last image)
	// TODO: There can only be one carousel per Piece right now

	// Activate the first image of each carousel by default
	$(".piece._carousel .image-set").each( function() {
		activateCarouselIndex($(this), 0);
	});

	// Add swipe gestures to image-sets
    $(".piece._carousel .image-set").swipe( {
    	tap:function(event, target) {
    		if ($(target).hasClass("image")) {
		        scrollToCarouselImage($(target));
    		}
		},
    	swipeStatus: function(event, phase, direction, distance, duration, fingerCount) {
    		// console.log("threshold 1: "+$.fn.swipe#option.threshold);
    		// console.log("threshold 2: "+$(this).swipe("option", "threshold"));

    		var $piece = $(this).closest(".piece");

    		if (phase == "start") {
    			var transformMatrix = $(this).css("-webkit-transform") || $(this).css("-moz-transform") || $(this).css("-ms-transform") || $(this).css("-o-transform") || $(this).css("transform");
    			var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
    			startPosition = parseInt(matrix[12] || matrix[4]);
    			
    			// Initiate variables
    			activeIndex = getCarouselActiveIndex($(this));
    			$activeImage = $(this).find(".image").eq(activeIndex);
				activeFocusPoint = findImageFocusPoint($piece, $activeImage);
				imageSetCount = $(this).find(".image").size();
				prevDistance = 0;
				rightFocusPoint = null;
				leftFocusPoint = null;
				changeActiveImage = false;
				initialDirection = null;
				$(this).swipe("option", "allowPageScroll", "auto");
				/*if (activeIndex+1 < imageSetCount-1) {
					rightFocusPoint = findImageFocusPoint($piece, $(this).find(".image").eq(activeIndex+1) );
				}
				if (activeIndex > 1) {
					leftFocusPoint = findImageFocusPoint($piece, $(this).find(".image").eq(activeIndex-1) );
				}*/
    			
    		}

    		if (phase == "move") {
    			if (!initialDirection) { // Determine initial direction
    				if (direction == "left" || direction == "right") {
    					initialDirection = "horizontal";
    					$(this).swipe("option", "allowPageScroll", "none"); // Disable scrolling if horizontal
	    			}
	    			else {
	    				initialDirection = "vertical";
	    			}
    			}
    			
    			// Only move the carousel if swipe started as horizontal
    			if (initialDirection == "horizontal" && (direction == "left" || direction == "right")) {
	    			$(this).css("transition-duration", "0ms"); // So carousel doesn't lag
	    		    var currPosition = 0;

	    		    // Determine current swiping direction (TouchSwipe only changes direction if the swipe crosses its start point)
	    		    if (direction == "left") {
	    		    	currDirection = (distance >= prevDistance) ? "left" : "right";
	    		    	currPosition = startPosition - distance;
	    		    } else if (direction == "right") {
	    		    	currDirection = (distance >= prevDistance) ? "right" : "left";
	    		        currPosition = startPosition + distance;
	    		    }
	    		    prevDistance = distance;

	    		    scrollCarousel($(this), currPosition); // Have carousel track with swipe while in motion
	    		    
	    		    // Decide whether to change the active image

	    		    // The threshold is the sweetspot where a specific image is always active. 
	    		    // Crossing the sweetspot changes the active image (depending on the direction it's moving)

	    		    // Currently swiping left; Decide whether to go to image on right
	    		    if (currDirection == "left" && activeIndex < imageSetCount-1) { 
	    		    	// Triggered by passing activeImage's left threshold
	    		    	if (currPosition < (activeFocusPoint - IMAGE_CHANGE_THRESHOLD)) { 
	    		    		activeIndex++; 
	    		    		changeActiveImage = true;
						}
	    		    	/*else if (rightFocusPoint != null) {
			    		    	print("rightFocusPoint");
	    		    		// Triggered by passing nextImage's right threshold (happens when backtracking left)
		    		    	if (currPosition < (rightFocusPoint + IMAGE_CHANGE_THRESHOLD)) { 
		    		    		activeIndex++;
		    		    		changeActiveImage = true;
		    		    		print("rightFocusPoint passed");
		    		    	}	 
						}*/
			    	}
			    	// Currently swiping right; Decide whether to go to image on left
	    		    else if (currDirection == "right" && activeIndex > 0) {
	    		    	// Triggered by passing activeImage's right threshold
	    		    	if (currPosition > (activeFocusPoint + IMAGE_CHANGE_THRESHOLD)) { 

	    		    		activeIndex--; 
		    		    	changeActiveImage = true;
	    		    	} 
	    		    	/*else if (leftFocusPoint != null) {
			    		    	print("leftFocusPoint");
	    		    		// Triggered by passing prevImage's left threshold (happens when backtracking right)
	    		    		if (currPosition > (leftFocusPoint - IMAGE_CHANGE_THRESHOLD)) { 
		    		    		activeIndex--;
			    		    	changeActiveImage = true;
			    		    	print("leftFocusPoint passed");
			    		    }
	    		    	}*/		
			    	}

			    	if (changeActiveImage) {
			    		activateCarouselIndex($(this), activeIndex); // Activate the new index

			    		// Update variables
			    		changeActiveImage = false;
		    			$activeImage = $(this).find(".image").eq(activeIndex);
						activeFocusPoint = findImageFocusPoint($piece, $activeImage);
						/*if (activeIndex+1 < imageSetCount-1) {
							print("set rightFocusPoint");
							rightFocusPoint = findImageFocusPoint($piece, $(this).find(".image").eq(activeIndex+1) );
						} else { rightFocusPoint = null; }
						if (activeIndex > 1) {
							print("set leftFocusPoint");
							leftFocusPoint = findImageFocusPoint($piece, $(this).find(".image").eq(activeIndex-1) );
						} else { leftFocusPoint = null; }*/
			    	}
			    }


    		} else if (phase == "cancel") {
    		    $(this).css("transition-duration", "0.6s");
    		} else if (phase == "end") {
    			$(this).css("transition-duration", "0.6s");
    			scrollCarousel($(this), activeFocusPoint); // Scroll to the active image's focus point
    		}
    	},
    	triggerOnTouchEnd: true,
    	triggerOnTouchLeave: false,
    	allowPageScroll: "auto",
    	threshold: SWIPE_THRESHOLD

    });

	// Carousel thumbnail is clicked
	$(".piece._carousel .thumbnail").click( function(event) {
		var $piece = $(this).closest(".piece");
		var index = $(this).closest(".thumbnail-set").find(".thumbnail").index($(this));
		goToCarouselIndex($piece, index);
	});

	function scrollToCarouselImage ($image) {
		var $piece = $image.closest(".piece");
		var index = $image.closest(".image-set").find(".image").index($image);
		goToCarouselIndex($piece, index);
	}

	// Go to the index of the carousel
	function goToCarouselIndex ($piece, index) {
		var $imageSet = $piece.find(".image-set");
		var $image = $imageSet.find(".image").eq(index);

		activateCarouselIndex ($imageSet, index);

		// Scroll to $image
		scrollCarousel($imageSet, findImageFocusPoint($piece, $image));
	}

	// The position of $imageSet that moves focus to the $image
	function findImageFocusPoint($piece, $image) {
		var leftAnchor = ($piece.width() - $image.width()) / 2;  /* Center-aligned */
		/* var leftAnchor = parseInt( $("#intro").css("margin-left") );  Left-aligned */
		return - $image.position().left + leftAnchor;
	}

	
	// Set clicked image + caption + thumbnail as _active at index
	function activateCarouselIndex ($imageSet, index) {
		var $image = $imageSet.find(".image").eq(index);
		var $captionSet = $imageSet.siblings(".caption-set");
		var $caption = $captionSet.find(".info").eq(index);
		var $thumbnailSet = $imageSet.siblings(".thumbnail-set");
		var $thumbnail = $thumbnailSet.find(".thumbnail").eq(index);

		activateItem($image, ".image");
		activateItem($caption, ".info");
		activateItem($thumbnail, ".thumbnail");
	}

	// Set $item as only one --active,
	function activateItem ($item, selector) {
		$item.addClass(ACTIVE_CLASS);
		$item.siblings(selector).removeClass(ACTIVE_CLASS);
	}

	function getCarouselActiveIndex ($imageSet) {
		var $activeImage = $imageSet.find(".image._active");
		return $activeImage.index();
	}

	// Scroll $imageSet to the specified position
	function scrollCarousel ($imageSet, position) {
		$imageSet.css("transform", "translateX("+position+"px)");
	}

   




});