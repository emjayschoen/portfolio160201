$(document).ready(function(){

	var screenWidth = window.innerWidth;

	var ACTIVE_CLASS = "--active";


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

	// TODO: Ignore images/thumbnails that are already active
	// TODO: Add arrows to thumbnails
	// TODO: Add arrow keyboard control
	// TODO: Add numeric keyboard control (treat it like chrome tabs where 1 = first image, ... , 9 = last image)
	// TODO: Add mobile responsiveness
	// TODO: There can only be one carousel per Piece right now


	// Activate the first image of each carousel by default
	/*$(".piece.--carousel .image-set").find(".image:first").load( function(){
		activateCarouselImage($(this));
	});*/

	// Carousel image is clicked
	/*$(".piece.--carousel .image").click( function(event) {
		var $piece = $(this).closest(".piece");
		var $imageSet = $(this).closest(".image-set");
		var index = $imageSet.find(".image").index($(this));
		goToCarouselIndex($piece, index);
		console.log("---image clicked---");
		// scrollToCarouselImage($(this));
	});*/

	var NEXT_IMAGE_THRESHOLD = Math.min(100, screenWidth*.2); // Number of pixels a swipe must pass to move focus to the next image
	print("NEXT_IMAGE_THRESHOLD: "+ NEXT_IMAGE_THRESHOLD);
	var activeIndex = 0, 
		$activeImage = null,
		$prevImage = null,
		activeFocusPoint = 0,
		prevFocusPoint = null,
		imageSetCount = 0,
		startPosition = 0,
		prevDistance = 0,
		changeActiveImage = false,
		currDirection;



    $(".piece.--carousel .image-set").swipe( {
    	triggerOnTouchEnd: true,
    	triggerOnTouchLeave: false,
    	allowPageScroll: "vertical",
    	threshold: 25,
    	tap:function(event, target) {
	         scrollToCarouselImage($(target));
		},
    	swipeStatus: function(event, phase, direction, distance, duration, fingerCount) {
    		// console.log("threshold 1: "+$.fn.swipe#option.threshold);
    		// console.log("threshold 2: "+$(this).swipe("option", "threshold"));
    		// console.log("tap: "+$(this).swipe("option", "tap"));
    		// console.log("fingerCount: "+fingerCount);
    		print("swipeStatus");

    		var $piece = $(this).closest(".piece");

    		if (phase == "start") {
    			var transformMatrix = $(this).css("-webkit-transform") || $(this).css("-moz-transform") || $(this).css("-ms-transform") || $(this).css("-o-transform") || $(this).css("transform");
    			var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
    			startPosition = parseInt(matrix[12] || matrix[4]);
    			
    			activeIndex = getCarouselActiveIndex($(this));
    			$activeImage = $(this).find(".image").eq(activeIndex);
				activeFocusPoint = findImageFocusPoint($piece, $activeImage);
				imageSetCount = $(this).find(".image").size();
				prevDistance = 0;

				prevFocusPoint = null;
				$prevImage = null;
				changeActiveImage = false;
    			
    			// console.log("startPosition: "+startPosition);
    		}
    		//If we are moving before swipe, and we are going L or R in X mode, or U or D in Y mode then drag.
    		if (phase == "move" && (direction == "left" || direction == "right")) {

    			

    			$(this).css("transition-duration", "0ms");
    		    
    		    var currPosition = 0;

    		    if (direction == "left") {
    		    	currDirection = (distance >= prevDistance) ? "left" : "right";
    		    	currPosition = startPosition - distance;
    		    	scrollCarousel($(this), currPosition);
    		    } else if (direction == "right") {
    		    	currDirection = (distance >= prevDistance) ? "right" : "left";
    		        currPosition = startPosition + distance;
    		        scrollCarousel($(this), currPosition);
    		    }
    		    prevDistance = distance;

    		    if (currDirection == "left") { // Swiping left
					
    		    	if ((activeFocusPoint - NEXT_IMAGE_THRESHOLD) > currPosition) { // Hit active.threshold.left
    		    		activeIndex = Math.min(activeIndex + 1, imageSetCount - 1); // --> activeIndex++
    		    		changeActiveImage = true;
						print("currDirection: "+currDirection);
					}
    		    	else if (activeIndex+1 < imageSetCount-1) {
    		    		$prevImage = $(this).find(".image").eq(activeIndex+1);
						prevFocusPoint = findImageFocusPoint($piece, $prevImage);
	    		    	if ((prevFocusPoint + NEXT_IMAGE_THRESHOLD) > currPosition)  { // Hit img[activeIndex+1].threshold.right
	    		    		activeIndex = Math.min(activeIndex + 1, imageSetCount - 1); // --> activeIndex++
	    		    		changeActiveImage = true;
							// print("currDirection: "+currDirection+"  prevFocusPoint: "+prevFocusPoint);
	    		    	}	 
					}
		    	}
    		    else if (currDirection == "right") { // Swiping right
    		    		 
    		    	if ((activeFocusPoint + NEXT_IMAGE_THRESHOLD) < currPosition) { // Hit active.threshold.right 
    		    		activeIndex = Math.max(activeIndex - 1, 0); // --> activeIndex--
	    		    	changeActiveImage = true;
	    		    	// print("CurrDirection: "+currDirection);
    		    	} 
    		    	else if (activeIndex > 1) {
    		    		$prevImage = $(this).find(".image").eq(activeIndex-1);
						prevFocusPoint = findImageFocusPoint($piece, $prevImage);
    		    		if ((prevFocusPoint - NEXT_IMAGE_THRESHOLD) < currPosition) { // Hit img[activeIndex-1].threshold.left 
	    		    		activeIndex = Math.max(activeIndex - 1, 0); // --> activeIndex--
		    		    	changeActiveImage = true;
		    		    	// print("CurrDirection: "+currDirection+"  prevFocusPoint: "+prevFocusPoint);
		    		    }
    		    	}		
		    	}

		    	if (changeActiveImage) {
		    		activateCarouselIndex($(this), activeIndex);
	    			$activeImage = $(this).find(".image").eq(activeIndex);
					activeFocusPoint = findImageFocusPoint($piece, $activeImage);
		    	}


    		} else if (phase == "cancel") {
    		    print("CANCEL");
    		    $(this).css("transition-duration", "0.6s");
    		} else if (phase == "end") {
    			print("END");
    			$(this).css("transition-duration", "0.6s");
    			scrollCarousel($(this), activeFocusPoint);
    		}
    	}

    });

	function scrollToCarouselImage ($image) {
		var $piece = $image.closest(".piece");
		var $imageSet = $image.closest(".image-set");
		var index = $imageSet.find(".image").index($image);
		goToCarouselIndex($piece, index);
		print("---image clicked---");
	}

	// Carousel thumbnial is clicked
	$(".piece.--carousel .thumbnail").click( function(event) {
		var $piece = $(this).closest(".piece");
		var $thumbnailSet = $(this).closest(".thumbnail-set");
		var index = $thumbnailSet.find(".thumbnail").index($(this));
		goToCarouselIndex($piece, index);
		// scrollToCarouselThumbnail($(this));
	});

	function getCarouselActiveIndex ($imageSet) {
		var $activeImage = $imageSet.find(".image.--active");
		return $activeImage.index();
	}

	function activateCarouselIndex ($imageSet, index) {
		var $image = $imageSet.find(".image").eq(index);
		var $captionSet = $imageSet.siblings(".caption-set");
		var $caption = $captionSet.find(".info").eq(index);
		var $thumbnailSet = $imageSet.siblings(".thumbnail-set");
		var $thumbnail = $thumbnailSet.find(".thumbnail").eq(index);

		// Set clicked image + caption + thumbnail as --active
		activateItem($image, ".image");
		activateItem($caption, ".info");
		activateItem($thumbnail, ".thumbnail");
	}

	function goToCarouselIndex ($piece, index) {
		var $imageSet = $piece.find(".image-set");
		var $image = $imageSet.find(".image").eq(index);

		activateCarouselIndex ($imageSet, index);

		// Scroll to $image
		scrollCarousel($imageSet, findImageFocusPoint($piece, $image));
	}


	// Set $item as only one --active,
	function activateItem ($item, selector) {
		$item.addClass(ACTIVE_CLASS);
		$item.siblings(selector).removeClass(ACTIVE_CLASS);
	}

	// The position of $imageSet that moves focus to the $image
	function findImageFocusPoint($piece, $image) {
		var leftAnchor = ($piece.width() - $image.width()) / 2;  /* Center-aligned */
		/* var leftAnchor = parseInt( $("#intro").css("margin-left") );  Left-aligned */
		return - $image.position().left + leftAnchor;
	}

	// Scroll $imageSet to the specified position
	function scrollCarousel ($imageSet, position) {
		$imageSet.css("transform", "translateX("+position+"px)");
	}


	// Ways of moving a carousel:

	// 1. Click an image 				Known: $image
	// 2. Click a thumbnail 			Known: $thumbnail
	// 3. Swipe carousel (active) 		Known: $imageSet
	// 4. Swipe carousel (end) 			Known: $imageSet, $image	
	// 5. Swipe carousel (cancel)		Known: $imageSet, $image
	// 6. Arrow 'next'	
	// 7. Arrow 'previous'


	// Steps of moving the carousel:
	
	// J. Mark $image as --active 				Needed: $image
	// K. Mark $thumbnail as --active 			Needed: $thumbnail
	// L. Move --active image to focus point 	Needed: $piece, $imageSet, $image


	
   




});