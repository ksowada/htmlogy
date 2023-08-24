/**
 * @class
 * for Image,Video or other elements to resize
 */
class Sizes {
	/**
	 * read original Elements dimension, in px
	 * @param {HTMLElement} htmlEl a Element that may represent a image or video or something else
	 * @returns {object} returning original src dimension with .width and .height
	 */
	static getDim(htmlEl) {
		const isVideo = (htmlEl.localName=='video')
		const originalDim = {}
		originalDim.width = (isVideo)?htmlEl.videoWidth:htmlEl.naturalWidth
		originalDim.height = (isVideo)?htmlEl.videoHeight:htmlEl.naturalHeight
		return originalDim
	}
	/**
	 * center el in its div
	 * use also padding-property to increase padding
	 * @param {HTMLElement} htmlEl to center
	 * @param {number} imgWidth actual given width
	 * @param {number} imgHeight actual given height
	 */
	static center(htmlEl,imgWidth,imgHeight) {
		if (!imgWidth || !imgHeight) return
		const img = {width:imgWidth,height:imgHeight}
		const clientWidth = htmlEl.clientWidth
		const clientHeight = htmlEl.clientHeight
		// window.getComputedStyle(htmlEl.parent)
		const paddingStr = window.getComputedStyle(htmlEl.parentElement).padding
		const paddingPx = Math.round(paddingStr.substring(0,paddingStr.length-2)) // ignore pixel decimals : easiness
		console.debug('Sizes:center:padding:'+paddingPx)

		const clientCorr = {width:clientWidth - 2*paddingPx,height:clientHeight - 2*paddingPx}

		const wished = Sizes.matchBoundsKeepProp(clientCorr,img)

		const marginLeft = (clientCorr.width-wished.width)/2
		const marginTop = (clientCorr.height-wished.height)/2
		htmlEl.style.setProperty('padding-left',Math.round(marginLeft)+'px')
		htmlEl.style.setProperty('padding-top',Math.round(marginTop)+'px')
		// htmlEl.style.position = 'relative'
		// htmlEl.width=wishedWidth
		// htmlEl.height=wishedHeight
	}
	static setQuadByParent(htmlEl) {
		const clientWidth = htmlEl.parentElement.clientWidth
		const clientHeight = htmlEl.parentElement.clientHeight
		const clientPropo = clientWidth/clientHeight
		// window.getComputedStyle(htmlEl.parent)
		const paddingStr = window.getComputedStyle(htmlEl.parentElement).padding
		const paddingPx = Math.round(paddingStr.substring(0,paddingStr.length-2)) // ignore pixel decimals : easiness
		console.log('Sizes:setQuadByParent:padding:'+paddingPx)
		const clientWidthCorr = clientWidth - 2*paddingPx
		const clientHeightCorr = clientHeight - 2*paddingPx
		const imgWidth = htmlEl.naturalWidth
		const imgHeight = htmlEl.naturalHeight
		let wishedWidth = 0
		let wishedHeight = 0
		if (htmlEl.complete && imgHeight !== 0) {
			if (imgWidth==0 || imgHeight==0) {
				console.log('natural img size broken. onLoad missed?')
			}
			const imgPropo = imgWidth/imgHeight
			if (clientPropo>imgPropo) { // client more width than img
				wishedWidth = clientHeightCorr*imgPropo
				wishedHeight = clientHeightCorr
			} else {
				wishedWidth = clientWidthCorr
				wishedHeight = clientWidthCorr/imgPropo
			}
		} else {
			console.log('natural img size broken or not loaded. onLoad missed?')
			htmlEl.style.display = 'none'
		}
		const marginLeft = (clientWidthCorr-wishedWidth)/2
		htmlEl.style.left = Math.round(marginLeft)+'px'
		htmlEl.width=wishedWidth
		htmlEl.height=wishedHeight
	}
	static setQuad(htmlEl) {
		let clientWidth = htmlEl.parentElement.clientWidth
		const width = htmlEl.naturalWidth
		const height = htmlEl.naturalHeight
		let wishedWidth = 0
		let wishedHeight = 0
		if (htmlEl.complete && height !== 0) {
			if (width==0 || height==0) {
				console.log('natural img size broken. onLoad missed?')
			}
			const proportion = width/height
			if (width>height) {
				wishedWidth = clientWidth
				wishedHeight = clientWidth/proportion
			} else {
				wishedWidth = clientWidth*proportion
				wishedHeight = clientWidth
			}
		} else {
			console.log('natural img size broken or not loaded. onLoad missed?')
			htmlEl.style.display = 'none'
		}
		htmlEl.width=wishedWidth
		htmlEl.height=wishedHeight
		let marginLeft = (clientWidth-wishedWidth)/2
		htmlEl.style.left = Math.round(marginLeft)+'px'
		htmlEl.style.height = Math.round(clientWidth)+'px' // use to set outer div to image-proportion (f.e. height diverce icons)
	}
	/**
	 * for quadratic divs
	 * @param {HTMLElement} htmlEl element to modify
	 */
	static setQuadDiv(htmlEl) {
		let clientWidth = htmlEl.parentElement.clientWidth
		console.log('clientWidth:'+clientWidth)
		htmlEl.width=clientWidth
		htmlEl.height=clientWidth
		htmlEl.style.height = Math.round(clientWidth)+'px' // use to set outer div to image-proportion (f.e. height diverce icons)
	}
	static setQuadSize(htmlEl,widthPx) {
		const width = htmlEl.naturalWidth
		const height = htmlEl.naturalHeight
		let wishedWidth = 0
		let wishedHeight = 0
		if (htmlEl.complete && height !== 0) {
			if (width==0 || height==0) {
				console.log('natural img size broken. onLoad missed?')
			}
			const proportion = width/height
			if (width>height) {
				wishedWidth = widthPx
				wishedHeight = widthPx/proportion
			} else {
				wishedWidth = widthPx*proportion
				wishedHeight = widthPx
			}
		} else {
			console.log('natural img size broken or not loaded. onLoad missed?')
			htmlEl.style.display = 'none'
		}
		htmlEl.width=wishedWidth
		htmlEl.height=wishedHeight
		let marginLeft = (widthPx-wishedWidth)/2
		htmlEl.style.left = Math.round(marginLeft)+'px'
		htmlEl.style.height = Math.round(widthPx)+'px' // use to set outer div to image-proportion (f.e. height diverce icons)
	}
	/**
	 * set a video or image or other HTMLElement width and height at once
	 * - do this by setting the style of width and also max-width, for issues with limited max-width given by some CSS-Toolkits
	 * - also round style property that will be set
	 * @param {HTMLElement} htmlEl an element to modify
	 * @param {object} dim a Object including .width and .height
	 */
	static setDim(htmlEl,dim) {
		let widthStr = Math.round(dim.width)+'px'
		let heightStr = Math.round(dim.height)+'px'
		htmlEl.style.setProperty('width',widthStr)
		htmlEl.style.setProperty('height',heightStr)

		// hack for limited layouts like Tailwind utilities
		htmlEl.style.setProperty('max-width',widthStr)
		htmlEl.style.setProperty('max-height',heightStr)
	}
	/**
	 * set a video or image or other HTMLElement width and height at once
	 * - do this by setting the style of width and also max-width, for issues with limited max-width given by some CSS-Toolkits
	 * - also round style property that will be set
	 * @param {HTMLElement} htmlEl an element to modify
	 * @param {number} width a number will be rounded
	 * @param {number} height a number will be rounded
	 */
	static setSize(htmlEl,width,height) {
		let wishedWidth = Math.round(width)+'px'
		let wishedHeight = Math.round(height)+'px'
		htmlEl.style.setProperty('width',wishedWidth)
		htmlEl.style.setProperty('height',wishedHeight)

		// hack for limited layouts like Tailwind utilities
		htmlEl.style.setProperty('max-width',wishedWidth)
		htmlEl.style.setProperty('max-height',wishedHeight)
	}
	static setSizeOverlappingWithMargin(htmlEl,master,options) {
		const clientWidth = master.clientWidth
		const clientHeight = master.clientHeight
		let wishedWidth = (options.widthOff!==undefined) ? clientWidth+options.widthOff+'px' : clientWidth+'px'
		let wishedHeight = (options.heightOff!==undefined) ? clientHeight+options.heightOff+'px' : clientHeight+'px'
		// overlap by margin-left about the same width of master
		let marginLeft = (options.marginLeftOff!==undefined) ? -clientWidth-options.marginLeftOff+'px' : -clientWidth+'px'
		htmlEl.style.setProperty('width',wishedWidth)
		htmlEl.style.setProperty('height',wishedHeight)
		htmlEl.style.setProperty('margin-left',marginLeft)
	}
	/**
	 * match an image's or video's dimension given with .width x .height to a bound rect given by width x height but keep proportion of original
	 * @param {object} bounds maximal dimension with .width and .height
	 * @param {object} original original dimension with .width and .height that's proportion shall be kept
	 * @returns {object} wished dimension with .width and .height
	 */
	static matchBoundsKeepProp(bounds,original) {
		let wished = {}
		const boundsProp = bounds.width/bounds.height
		const originalProp = original.width/original.height
		if (boundsProp>originalProp) { // client more width than img
			wished.width = bounds.height*originalProp
			wished.height = bounds.height
		} else {
			wished.width = bounds.width
			wished.height = bounds.width/originalProp
		}
		return wished
	}
	/**
	 * force a element to use exact position and size of another
	 * @param {HTMLElement} holeEl element to copy its position and size
	 * @param {HTMLElement} ballEl element to overlap the holeEl
	 */
	static usePlace(holeEl,ballEl) {
		const holeRect = {}
		holeRect.top = holeEl.offsetTop
		holeRect.left = holeEl.offsetLeft
		holeRect.width = holeEl.clientWidth
		holeRect.height = holeEl.clientHeight
		Sizes.place(ballEl,holeRect)
	}
	static setWidthSameAs(destEl,srcEl) {
		const widthToSet = srcEl.clientWidth
		const widthToSetPx = widthToSet+'px'
		destEl.style.setProperty('min-width',widthToSetPx)
		destEl.style.setProperty('max-width',widthToSetPx)
		destEl.style.setProperty('width',widthToSetPx)
	}
	/**
	 * position an element to some dimension by CSS and set position:absolute
	 * @param {HTMLElement} htmlEl element to position
	 * @param {object} rect an object containing at least .width | .height | .top | .left
	 */
	static place(htmlEl,rect) {
		htmlEl.style.setProperty('position','absolute')
		htmlEl.style.setProperty('top',Sizes.in_px_int(rect.top))
		htmlEl.style.setProperty('left',Sizes.in_px_int(rect.left))
		htmlEl.style.setProperty('width',Sizes.in_px_int(rect.width))
		htmlEl.style.setProperty('height',Sizes.in_px_int(rect.height))
	}
	/**
	 * return a valid string with px-suffix for use in CSS or similar
	 * @param {number} px some cnt of px
	 * @returns {string} f.e. 144px if px=143.623
	 */
	static in_px_int(px) {
		return Math.round(px)+'px'
	}
}
export default Sizes