$(document).ready(function(){

	var screenWidth = window.innerWidth;
	var OUTER_MARGIN = 180;
	var contentWidth = screenWidth - OUTER_MARGIN*2;
	var CAROUSEL_IMAGE_MAX_WIDTH = $(".ideas .piece_.image-set").css("width");




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

	$(".piece.--carousel .image").click( function(event) {
		activateCarouselImage($(this));
	});

	$(".piece.--carousel .thumbnail").click( function(event) {
		activateCarouselThumbnail($(this));
	});

	function getCarouselActiveIndex ($piece) {
		var $activeImage = $piece.find(".image-set .image.--active");
		return getCarouselItemIndex($activeImage);
	}
	function getCarouselItemIndex ($item) {
		return $item.index();
	}

	function goToIndex ($piece, index) {
		var $currImageSet = $currPiece.find(".image-set");
		var $currThumbnailSet = $currPiece.find(".thumbnail-set");
		var $image = $currImageSet.find(".image").eq(index);
		var $thumbnail = $currThumbnailSet.find(".thumbnail").eq(index);
	}

	function activateCarouselImage ($image) {
		var $currPiece = $image.closest(".piece");
		var $currImageSet = $image.closest(".image-set");
		var $currThumbnailSet = $currPiece.find(".thumbnail-set");
		var imageIndex = $currImageSet.find(".image").index($image);
		var $thumbnail = $currThumbnailSet.find(".thumbnail").eq(imageIndex);

		activateCarousel($currPiece, $image, $currImageSet, $thumbnail, $currThumbnailSet);

	}

	function activateCarouselThumbnail ($thumbnail) {
		var $currPiece = $thumbnail.closest(".piece");
		var $currImageSet = $currPiece.find(".image-set");
		var $currThumbnailSet = $thumbnail.closest(".thumbnail-set");
		var thumbnailIndex = $currThumbnailSet.find(".thumbnail").index($thumbnail);
		var $image = $currImageSet.find(".image").eq(thumbnailIndex);

		activateCarousel($currPiece, $image, $currImageSet, $thumbnail, $currThumbnailSet);
	}

	function activateCarousel ($currPiece, $image, $currImageSet, $thumbnail, $currThumbnailSet) {

		// Set clicked image as only one --active
		$currImageSet.find(".image").removeClass("--active");
		$image.addClass("--active");

		// Set corresponding thumbnail as only one --active
		$currThumbnailSet.find(".thumbnail").removeClass("--active");
		$thumbnail.addClass("--active");

		// Move --active image
		var leftAnchor = ($currPiece.width() - $image.width()) / 2;  /* Center-aligned */
		/* var leftAnchor = parseInt( $("#intro").css("margin-left") );  Left-aligned */
		var imageSetLeftOffset = $currImageSet.position().left;
		var nextImageSetLeft = /* */ - $image.position().left + leftAnchor;
		$currImageSet.css("transform", "translateX("+nextImageSetLeft+"px)");

		console.log("leftAnchor: "+ leftAnchor);
		console.log("nextImageSetLeft: "+ nextImageSetLeft);

		// Move --active thumbnail
		/*var nextThumbnailSetLeft = - $thumbnail.position().left + ($currPiece.width() - $thumbnail.width()) / 2;
		$currThumbnailSet.css("left", nextThumbnailSetLeft);*/
	}

	// Piece thumbnails
	/*$(".piece_.thumbnail").click( function(event){

		// Get image source
		var $imageSource = $(this).attr("src");
		console.log($imageSource); 

		// Create replacement image
		var $nextImage = $('<img class="piece_ image" src="">').attr("src", $imageSource);
		console.log($nextImage); 

		// Add next image to DOM
		var $currImage = $(this).parent().find(".piece_.image");
		$currImage.css("opacity",".5");
		$nextImage.insertAfter($currImage);

		// Perform transition


	});*/


});