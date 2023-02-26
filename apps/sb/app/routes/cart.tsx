import {
  Cart,
  CartBuyerIdentityInput,
  CartInput,
  CartLineInput,
  CartUserError,
  UserError,
} from '@shopify/hydrogen/storefront-api-types';
import {ActionArgs, AppLoadContext, json} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

export enum CartAction {
  ADD_TO_CART = 'ADD_TO_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  UPDATE_CART = 'UPDATE_CART',
  UPDATE_DISCOUNT = 'UPDATE_DISCOUNT',
  UPDATE_BUYER_IDENTITY = 'UPDATE_BUYER_IDENTITY',
}
export type CartActions = keyof typeof CartAction;

/**
 * Validates that a url is local
 * @param url
 * @returns `true` if local `false`if external domain
 */
export function isLocalPath(url: string) {
  try {
    // We don't want to redirect cross domain,
    // doing so could create fishing vulnerability
    // If `new URL()` succeeds, it's a fully qualified
    // url which is cross domain. If it fails, it's just
    // a path, which will be the current domain.
    new URL(url);
  } catch (e) {
    return true;
  }

  return false;
}

export async function action({request, context}: ActionArgs) {
  const {session, storefront} = context;
  const headers = new Headers();

  const [formData, storedCartId, customerAccessToken] = await Promise.all([
    request.formData(),
    session.get('cartId'),
    session.get('customerAccessToken'),
  ]);

  let cartId = storedCartId;

  const cartAction = formData.get('cartAction') as CartActions;
  invariant(cartAction, 'No cartAction defined');

  const countryCode = formData.get('countryCode')
    ? (formData.get('countryCode') as CartBuyerIdentityInput['countryCode'])
    : null;

  let status = 200;
  let result: {
    cart: Cart;
    errors?: CartUserError[] | UserError[];
  };

  switch (cartAction) {
    case CartAction.ADD_TO_CART:
      // eslint-disable-next-line no-case-declarations
      const lines = formData.get('lines')
        ? (JSON.parse(String(formData.get('lines'))) as CartLineInput[])
        : ([] as CartLineInput[]);
      invariant(lines.length, 'No lines to add');

      /**
       * If no previous cart exists, create one with the lines.
       */
      if (!cartId) {
        result = await cartCreate({
          input: countryCode ? {lines, buyerIdentity: {countryCode}} : {lines},
          storefront,
        });
      } else {
        result = await cartAdd({
          cartId,
          lines,
          storefront,
        });
      }

      cartId = result.cart.id;

      break;
    // case CartAction.REMOVE_FROM_CART:
    //   const lineIds = formData.get('linesIds')
    //     ? (JSON.parse(String(formData.get('linesIds'))) as Cart['id'][])
    //     : ([] as Cart['id'][]);
    //   invariant(lineIds.length, 'No lines to remove');

    //   result = await cartRemove({
    //     cartId,
    //     lineIds,
    //     storefront,
    //   });

    //   cartId = result.cart.id;

    //   break;
    // case CartAction.UPDATE_CART:
    //   const updateLines = formData.get('lines')
    //     ? (JSON.parse(String(formData.get('lines'))) as CartLineUpdateInput[])
    //     : ([] as CartLineUpdateInput[]);
    //   invariant(updateLines.length, 'No lines to update');

    //   result = await cartUpdate({
    //     cartId,
    //     lines: updateLines,
    //     storefront,
    //   });

    //   cartId = result.cart.id;

    //   break;
    // case CartAction.UPDATE_DISCOUNT:
    //   invariant(cartId, 'Missing cartId');

    //   const formDiscountCode = formData.get('discountCode');
    //   const discountCodes = ([formDiscountCode] || ['']) as string[];

    //   result = await cartDiscountCodesUpdate({
    //     cartId,
    //     discountCodes,
    //     storefront,
    //   });

    //   cartId = result.cart.id;

    //   break;
    // case CartAction.UPDATE_BUYER_IDENTITY:
    //   const buyerIdentity = formData.get('buyerIdentity')
    //     ? (JSON.parse(
    //         String(formData.get('buyerIdentity')),
    //       ) as CartBuyerIdentityInput)
    //     : ({} as CartBuyerIdentityInput);

    //   result = cartId
    //     ? await cartUpdateBuyerIdentity({
    //         cartId,
    //         buyerIdentity: {
    //           ...buyerIdentity,
    //           customerAccessToken,
    //         },
    //         storefront,
    //       })
    //     : await cartCreate({
    //         input: {
    //           buyerIdentity: {
    //             ...buyerIdentity,
    //             customerAccessToken,
    //           },
    //         },
    //         storefront,
    //       });

    //   cartId = result.cart.id;

    //   break;
    default:
      invariant(false, `${cartAction} cart action is not defined`);
  }

  /**
   * The Cart ID may change after each mutation. We need to update it each time in the session.
   */
  session.set('cartId', cartId);
  headers.set('Set-Cookie', await session.commit());

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string' && isLocalPath(redirectTo)) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  const {cart, errors} = result;
  return json(
    {
      cart,
      errors,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

const USER_ERROR_FRAGMENT = `#graphql
  fragment ErrorFragment on CartUserError {
    message
    field
    code
  }
`;

const LINES_CART_FRAGMENT = `#graphql
  fragment CartLinesFragment on Cart {
    id
    totalQuantity
  }
`;

//! @see: https://shopify.dev/api/storefront/2022-01/mutations/cartcreate
const CREATE_CART_MUTATION = `#graphql
  mutation ($input: CartInput!, $country: CountryCode = ZZ, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        ...CartLinesFragment
      }
      errors: userErrors {
        ...ErrorFragment
      }
    }
  }
  ${LINES_CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
`;

/**
 * Create a cart with line(s) mutation
 * @param input CartInput https://shopify.dev/api/storefront/2022-01/input-objects/CartInput
 * @see https://shopify.dev/api/storefront/2022-01/mutations/cartcreate
 * @returns result {cart, errors}
 * @preserve
 */
export async function cartCreate({
  input,
  storefront,
}: {
  input: CartInput;
  storefront: AppLoadContext['storefront'];
}) {
  const {cartCreate} = await storefront.mutate<{
    cartCreate: {
      cart: Cart;
      errors: CartUserError[];
    };
    errors: UserError[];
  }>(CREATE_CART_MUTATION, {
    variables: {input},
  });

  invariant(cartCreate, 'No data returned from cartCreate mutation');

  return cartCreate;
}

const ADD_LINES_MUTATION = `#graphql
    mutation ($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode = ZZ, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartLinesFragment
        }
        errors: userErrors {
          ...ErrorFragment
        }
      }
    }
    ${LINES_CART_FRAGMENT}
    ${USER_ERROR_FRAGMENT}
  `;

/**
 * Storefront API cartLinesAdd mutation
 * @param cartId
 * @param lines [CartLineInput!]! https://shopify.dev/api/storefront/2022-01/input-objects/CartLineInput
 * @see https://shopify.dev/api/storefront/2022-01/mutations/cartLinesAdd
 * @returns result {cart, errors}
 * @preserve
 */
export async function cartAdd({
  cartId,
  lines,
  storefront,
}: {
  cartId: string;
  lines: CartLineInput[];
  storefront: AppLoadContext['storefront'];
}) {
  const {cartLinesAdd} = await storefront.mutate<{
    cartLinesAdd: {
      cart: Cart;
      errors: CartUserError[];
    };
  }>(ADD_LINES_MUTATION, {
    variables: {cartId, lines},
  });

  invariant(cartLinesAdd, 'No data returned from cartLinesAdd mutation');

  return cartLinesAdd;
}
